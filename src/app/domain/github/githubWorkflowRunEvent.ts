import { AppState } from '../../environment/AppState'
import { fromRawGithubWorkflowRunEvent, GithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent'
import { logger } from '../../util/logging'
import { putWorkflowRunEventIfKeyDoesntExist } from '../entityStore/entities/GithubWorkflowRunEventEntity'
import { executeAndCatchConditionalCheckFailed } from '../entityStore/entityStoreOperationSupport'
import { RawGithubWorkflowRunEvent } from '../types/rawGithub/RawGithubWorkflowRunEvent'
import { getUserIdsForAccount } from './githubMembership'
import { saveRuns } from './githubWorkflowRun'
import { isoDifferenceMs } from '../../util/dateAndTime'
import { GithubUserId } from '../types/GithubUserId'

export async function processRawRunEvents(
  appState: AppState,
  rawRunEvents: RawGithubWorkflowRunEvent[],
  publishNotifications: boolean
) {
  const events = rawRunEvents.map(fromRawGithubWorkflowRunEvent)
  logger.debug(`Processing ${events.length} run events`)

  await saveEvents(appState, events)
  await saveRuns(appState, events, publishNotifications)
}

async function saveEvents(appState: AppState, eventsToKeep: GithubWorkflowRunEvent[]) {
  const newEvents = (
    await Promise.all(
      eventsToKeep.map(async (runEvent) => {
        return executeAndCatchConditionalCheckFailed(async () => {
          return await putWorkflowRunEventIfKeyDoesntExist(appState.entityStore, runEvent)
        })
      })
    )
  ).filter((x): x is GithubWorkflowRunEvent => x !== undefined)
  logger.debug(`Found ${newEvents.length} new run events`)
  return newEvents
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
  return isoDifferenceMs(event.createdAt, event.updatedAt)
}
