import { AppState } from '../../environment/AppState'
import { GithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent'
import {
  domainObjectsFromMultipleEventEntityResponse,
  executeAndCatchConditionalCheckFailed
} from '../entityStore/entityStoreOperationSupport'
import { GithubWorkflowRunEntity } from '../entityStore/entities/GithubWorkflowRunEntity'
import { saveLatestEvents } from './githubLatestWorkflowRunEvents'
import { sortBy } from '../../util/collections'
import { getEventUpdatedTimestamp } from './githubCommon'
import { sendToEventBridge } from '../../outboundInterfaces/eventBridgeBus'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../multipleContexts/eventBridge'
import { MultipleEntityCollectionResponse } from '@symphoniacloud/dynamodb-entity-store'

// A workflow run is the same as the most recent workflow run event for a given run ID

export async function saveRuns(
  appState: AppState,
  events: GithubWorkflowRunEvent[],
  publishNotifications: boolean
) {
  // We only want to notify for the most recent event per run, so sort events by most recent first
  const newEventsMostRecentFirst = sortBy(events, getEventUpdatedTimestamp, false)
  const eventsForNewOrUpdatedRuns: GithubWorkflowRunEvent[] = []

  // Do this sequentially since if we have multiple events for same
  // run we only want to save the most recent
  for (const event of newEventsMostRecentFirst) {
    const eventForUpdatedRun = await saveRun(appState, event)
    if (eventForUpdatedRun) {
      eventsForNewOrUpdatedRuns.push(eventForUpdatedRun)
    }
  }

  await saveLatestEvents(appState, eventsForNewOrUpdatedRuns)

  for (const newEvent of publishNotifications ? eventsForNewOrUpdatedRuns : []) {
    // GitHub sends a 'queued' event, then an 'in_progress' event.
    // As far as notifications are concerned we only for now care about in_progress
    // If we ever get more complete notifications configuration then 'queued' might be one we can allow people to opt-in to
    if (newEvent.status !== 'queued')
      await sendToEventBridge(appState, EVENTBRIDGE_DETAIL_TYPES.GITHUB_NEW_WORKFLOW_RUN_EVENT, newEvent)
  }
}

async function saveRun(appState: AppState, event: GithubWorkflowRunEvent) {
  return await executeAndCatchConditionalCheckFailed(async () => {
    await appState.entityStore.for(GithubWorkflowRunEntity).put(event, {
      conditionExpression: 'attribute_not_exists(PK) OR #updatedAt < :newUpdatedAt',
      expressionAttributeNames: { '#updatedAt': 'updatedAt' },
      expressionAttributeValues: { ':newUpdatedAt': event.updatedAt }
    })

    return event
  })
}

export function workflowRunsFromMultipleEventEntityResponse(
  allActivity: MultipleEntityCollectionResponse
): GithubWorkflowRunEvent[] {
  return domainObjectsFromMultipleEventEntityResponse(allActivity, GithubWorkflowRunEntity.type)
}
