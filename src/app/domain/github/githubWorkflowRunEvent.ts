import { AppState } from '../../environment/AppState'
import { fromRawGithubWorkflowRunEvent, GithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent'
import { logger } from '../../util/logging'
import {
  GithubWorkflowRunEventEntity,
  githubWorkflowRunEventSkPrefix
} from '../entityStore/entities/GithubWorkflowRunEventEntity'
import { executeAndCatchConditionalCheckFailed } from '../entityStore/entityStoreOperationSupport'
import { RawGithubWorkflowRunEvent } from '../types/rawGithub/RawGithubWorkflowRunEvent'
import { getMemberIds } from './githubMembership'
import { saveRuns } from './githubWorkflowRun'
import { rangeWhereSkBeginsWith } from '@symphoniacloud/dynamodb-entity-store'
import { isoDifferenceMs } from '../../util/dateAndTime'
import { GithubWorkflowKey } from '../types/GithubKeys'

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
          await appState.entityStore.for(GithubWorkflowRunEventEntity).put(runEvent, {
            conditionExpression: 'attribute_not_exists(PK)'
          })
          return runEvent
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
): Promise<number[]> {
  return getMemberIds(appState, runEvent.ownerId)
}

// Returns *all* the run events for each run (including in_progress) even if the run is complete
// If you just want the most recent run event per run then use githubWorkflowRun.ts instead
export async function getRunEventsForWorkflow(appState: AppState, key: GithubWorkflowKey) {
  return appState.entityStore
    .for(GithubWorkflowRunEventEntity)
    .queryAllByPkAndSk(key, rangeWhereSkBeginsWith(githubWorkflowRunEventSkPrefix(key)), {
      scanIndexForward: false
    })
}

export async function getRunEventsForWorkflowPage(
  appState: AppState,
  ownerId: number,
  repoId: number,
  workflowId: number,
  limit?: number
) {
  return await appState.entityStore
    .for(GithubWorkflowRunEventEntity)
    .queryOnePageByPkAndSk(
      { ownerId },
      rangeWhereSkBeginsWith(githubWorkflowRunEventSkPrefix({ repoId, workflowId })),
      { scanIndexForward: false, ...(limit ? { limit } : {}) }
    )
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
