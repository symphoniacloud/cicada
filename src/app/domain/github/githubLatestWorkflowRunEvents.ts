import { AppState } from '../../environment/AppState'
import { GithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent'
import { executeAndCatchConditionalCheckFailed } from '../entityStore/entityStoreOperationSupport'
import {
  latestWorkflowRunEventsPerWorkflowForAccount,
  putRunEventIfNoKeyExistsOrNewerThanExisting
} from '../entityStore/entities/GithubLatestWorkflowRunEventEntity'
import { GithubAccountId } from '../types/GithubAccountId'

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
