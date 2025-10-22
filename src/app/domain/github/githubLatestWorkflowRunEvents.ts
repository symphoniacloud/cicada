import { AppState } from '../../environment/AppState.js'
import { GithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent.js'
import { executeAndCatchConditionalCheckFailed } from '../entityStore/entityStoreOperationSupport.js'
import {
  latestWorkflowRunEventsPerWorkflowForAccount,
  putRunEventIfNoKeyExistsOrNewerThanExisting
} from '../entityStore/entities/GithubLatestWorkflowRunEventEntity.js'
import { GithubAccountId } from '../types/GithubAccountId.js'

export async function saveLatestRunPerWorkflow(appState: AppState, latestRun: GithubWorkflowRunEvent) {
  return await executeAndCatchConditionalCheckFailed(async () => {
    return await putRunEventIfNoKeyExistsOrNewerThanExisting(appState.entityStore, latestRun)
  })
}

export async function latestWorkflowRunEventsPerWorkflowForAccounts(
  appState: AppState,
  accountIds: GithubAccountId[]
) {
  return (
    await Promise.all(
      accountIds.map(async (accountId) =>
        latestWorkflowRunEventsPerWorkflowForAccount(appState.entityStore, accountId)
      )
    )
  ).flat()
}
