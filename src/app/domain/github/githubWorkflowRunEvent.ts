import { AppState } from '../../environment/AppState'
import {
  fromRawGithubWorkflowRunEvent,
  FullGithubWorkflowRunEvent,
  GithubWorkflowRunEvent
} from '../types/GithubWorkflowRunEvent'
import { logger } from '../../util/logging'
import { putWorkflowRunEventIfKeyDoesntExist } from '../entityStore/entities/GithubWorkflowRunEventEntity'
import { executeAndCatchConditionalCheckFailed } from '../entityStore/entityStoreOperationSupport'
import { RawGithubWorkflowRunEvent } from '../types/rawGithub/RawGithubWorkflowRunEvent'
import { getUserIdsForAccount } from './githubMembership'
import { saveRuns } from './githubWorkflowRun'
import { isoDifferenceMs } from '../../util/dateAndTime'
import { GithubUserId } from '../types/GithubUserId'
import { GithubRepoSummary, GithubWorkflowSummary } from '../types/GithubSummaries'
import { getWorkflow } from '../entityStore/entities/GithubWorkflowEntity'
import { fromRawGithubAccountId } from '../types/GithubAccountId'
import { fromRawGithubRepoId } from '../types/GithubRepoId'
import { fromRawGithubWorkflowId } from '../types/GithubWorkflowId'
import { GithubWorkflowKey } from '../types/GithubKeys'
import { fromRawAccountType } from '../types/GithubAccountType'
import { crawlOneWorkflow } from './crawler/crawlWorkflows'
import { GithubInstallationClient } from '../../outboundInterfaces/githubInstallationClient'
import { UserScopeReferenceData } from '../types/UserScopeReferenceData'
import { getWorkflowFromRefData } from './userScopeReferenceData'
import { throwFunction } from '../../../multipleContexts/errors'

export async function processRawRunEvent(
  appState: AppState,
  rawRunEvent: RawGithubWorkflowRunEvent,
  installationClient: GithubInstallationClient,
  publishNotifications: boolean
) {
  const workflow = await readOrLookupWorkflow(appState, rawRunEvent, installationClient)
  if (!workflow) {
    logger.warn('Failed to process run event - unable to find or crawl associated workflow', { rawRunEvent })
    return
  }

  await processRawRunEvents(appState, [workflow], [rawRunEvent], publishNotifications)
}

async function readOrLookupWorkflow(
  appState: AppState,
  rawRunEvent: RawGithubWorkflowRunEvent,
  installationClient: GithubInstallationClient
) {
  const workflowKey: GithubWorkflowKey = {
    accountId: fromRawGithubAccountId(rawRunEvent.repository.owner.id),
    repoId: fromRawGithubRepoId(rawRunEvent.repository.id),
    workflowId: fromRawGithubWorkflowId(rawRunEvent.workflow_id)
  }
  const loadedWorkflow = await getWorkflow(appState.entityStore, workflowKey)
  if (loadedWorkflow) return loadedWorkflow

  const repoSummary: GithubRepoSummary = {
    ...workflowKey,
    accountName: rawRunEvent.repository.owner.login,
    accountType: fromRawAccountType(rawRunEvent.repository.owner.type),
    repoName: rawRunEvent.repository.name
  }
  return await crawlOneWorkflow(appState, installationClient, repoSummary, workflowKey.workflowId)
}

export async function processRawRunEvents(
  appState: AppState,
  workflows: GithubWorkflowSummary[],
  rawRunEvents: RawGithubWorkflowRunEvent[],
  publishNotifications: boolean
) {
  if (rawRunEvents.length === 0) return
  logger.info(`Found ${rawRunEvents.length} total run events`)
  const newEvents = await saveEvents(appState, fromRawRunEvents(workflows, rawRunEvents))
  if (newEvents.length > 0) {
    logger.info(`Found ${newEvents.length} new run events`)
    await saveRuns(appState, newEvents, publishNotifications)
  }
}

export function fromRawRunEvents(
  workflows: GithubWorkflowSummary[],
  rawRunEvents: RawGithubWorkflowRunEvent[]
) {
  function workflowForRawRunEvent(run: RawGithubWorkflowRunEvent) {
    return (
      workflows.find(({ workflowId }) => workflowId === fromRawGithubWorkflowId(run.workflow_id)) ??
      throwFunction(`No workflow found for workflow ID on raw run ${run.id}`)()
    )
  }

  return rawRunEvents.map((run) => fromRawGithubWorkflowRunEvent(workflowForRawRunEvent(run), run))
}

async function saveEvents(appState: AppState, eventsToKeep: GithubWorkflowRunEvent[]) {
  // TODO - option here for optimization - load existing runEvents for repo (e.g. in time period) and pre-filter unchanged
  return (
    await Promise.all(
      eventsToKeep.map(async (runEvent) => {
        return executeAndCatchConditionalCheckFailed(async () => {
          return await putWorkflowRunEventIfKeyDoesntExist(appState.entityStore, runEvent)
        })
      })
    )
  ).filter((x): x is GithubWorkflowRunEvent => x !== undefined)
}

export async function getRelatedMemberIdsForRunEvent(
  appState: AppState,
  runEvent: GithubWorkflowRunEvent
): Promise<GithubUserId[]> {
  return getUserIdsForAccount(appState, runEvent.accountId)
}

export function runCompleted(event: GithubWorkflowRunEvent) {
  return event.conclusion !== undefined
}

// Used as part of notification UI, so don't change these unless also changing the
// notification code
export type WorkflowRunStatus = '✅' | '❌' | '⏳'

export function runBasicStatus(event: GithubWorkflowRunEvent): WorkflowRunStatus {
  return runCompleted(event) ? (event.conclusion === 'success' ? '✅' : '❌') : '⏳'
}

export function friendlyStatus(event: GithubWorkflowRunEvent) {
  if (runCompleted(event)) {
    const { conclusion } = event
    if (conclusion === 'success') return 'succeeded'
    if (conclusion === 'failure') return 'failed'
    return conclusion ?? 'complete'
  }
  const { status } = event
  if (status === 'in_progress') return 'in progress'
  return status ?? 'in progress'
}

export function elapsedTimeMs(event: GithubWorkflowRunEvent) {
  return isoDifferenceMs(event.runEventCreatedAt, event.runEventUpdatedAt)
}

export function toFullWorkflowRunEvent(
  refData: UserScopeReferenceData,
  event: GithubWorkflowRunEvent
): FullGithubWorkflowRunEvent {
  const workflowFromRefData = getWorkflowFromRefData(refData, event)
  if (!workflowFromRefData) throw new Error(`No workflow in ref data for ${JSON.stringify(event)}`)
  return {
    ...workflowFromRefData,
    ...event
  }
}

export function toFullWorkflowRunEvents(
  refData: UserScopeReferenceData,
  events: GithubWorkflowRunEvent[]
): FullGithubWorkflowRunEvent[] {
  return events.map((e) => toFullWorkflowRunEvent(refData, e))
}

export function workflowRunEventUpdatedTimestamp(runEvent: GithubWorkflowRunEvent) {
  return new Date(runEvent.runEventUpdatedAt).getTime()
}
