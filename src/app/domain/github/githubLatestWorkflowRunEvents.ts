import { AppState } from '../../environment/AppState'
import { GithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent'
import { executeAndCatchConditionalCheckFailed } from '../entityStore/entityStoreOperationSupport'
import {
  latestWorkflowRunEventsPerWorkflowForOwner,
  putIfNoKeyExistsOrNewerThanExisting
} from '../entityStore/entities/GithubLatestWorkflowRunEventEntity'

export async function saveLatestEvents(appState: AppState, newEvents: GithubWorkflowRunEvent[]) {
  // Update latest events if they are newer
  // TODO - need to think about concurrent runs. E.g. if two runs are in progress, one completes, the status is still "in progress"
  for (const newEvent of newEvents) {
    await executeAndCatchConditionalCheckFailed(async () => {
      await putIfNoKeyExistsOrNewerThanExisting(appState.entityStore, newEvent)
    })
  }
}

export async function latestWorkflowRunEventsPerWorkflowForOwners(appState: AppState, accountIds: number[]) {
  return (
    await Promise.all(
      accountIds.map(async (accountId) =>
        latestWorkflowRunEventsPerWorkflowForOwner(appState.entityStore, accountId)
      )
    )
  ).flat()
}
