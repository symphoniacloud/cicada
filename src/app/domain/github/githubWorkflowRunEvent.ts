import { AppState } from '../../environment/AppState'
import { fromRawGithubWorkflowRunEvent, GithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent'
import { logger } from '../../util/logging'
import {
  GithubWorkflowRunEventEntity,
  githubWorkflowRunEventSkPrefix
} from '../entityStore/entities/GithubWorkflowRunEventEntity'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../multipleContexts/eventBridge'
import { executeAndCatchConditionalCheckFailed } from '../entityStore/entityStoreOperationSupport'
import { sendToEventBridge } from '../../outboundInterfaces/eventBridgeBus'
import { RawGithubWorkflowRunEvent } from '../types/rawGithub/RawGithubWorkflowRunEvent'
import { getMemberIds } from './githubMembership'
import {
  MultipleEntityCollectionResponse,
  rangeWhereSkBeginsWith
} from '@symphoniacloud/dynamodb-entity-store'
import { saveLatestEvents } from './githubLatestWorkflowRunEvents'

export async function processRawRunEvents(
  appState: AppState,
  rawRunEvents: RawGithubWorkflowRunEvent[],
  publishNotifications: boolean
) {
  await processRunEvents(appState, rawRunEvents.map(fromRawGithubWorkflowRunEvent), publishNotifications)
}

export async function processRunEvents(
  appState: AppState,
  runEvents: GithubWorkflowRunEvent[],
  publishNotifications: boolean
) {
  // TOEventually - eventually get in progress too
  // TOEventually - this might not be sufficient - docs are ambiguous
  const eventsToKeep = runEvents.filter(({ status }) => status === 'completed')
  logger.debug(`Found ${eventsToKeep.length} interesting events`)

  const newEvents = await saveEvents(appState, eventsToKeep)
  await saveLatestEvents(appState, newEvents)

  for (const newEvent of publishNotifications ? newEvents : []) {
    await sendToEventBridge(appState, EVENTBRIDGE_DETAIL_TYPES.GITHUB_NEW_WORKFLOW_RUN_EVENT, newEvent)
  }
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

export function workflowRunEventsFromMultipleEventEntityResponse(
  allActivity: MultipleEntityCollectionResponse
): GithubWorkflowRunEvent[] {
  return workflowRunEventsFromMultiple(allActivity, GithubWorkflowRunEventEntity.type)
}

export function workflowRunEventsFromMultiple(
  allActivity: MultipleEntityCollectionResponse,
  entityType: string
) {
  return (allActivity.itemsByEntityType[entityType] as GithubWorkflowRunEvent[]) ?? []
}

// TOEventually - only completed runs, once we have in-progress
export async function getRunsForWorkflow(
  appState: AppState,
  ownerId: number,
  repoId: number,
  workflowId: number
) {
  return appState.entityStore
    .for(GithubWorkflowRunEventEntity)
    .queryAllByPkAndSk(
      { ownerId },
      rangeWhereSkBeginsWith(githubWorkflowRunEventSkPrefix({ repoId, workflowId })),
      { scanIndexForward: false }
    )
}

export function runWasSuccessful(event: GithubWorkflowRunEvent) {
  // TOEventually - handle incomplete
  return event.conclusion === 'success'
}
