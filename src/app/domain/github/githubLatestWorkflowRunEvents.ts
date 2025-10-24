import { AppState } from '../../environment/AppState.js'
import { executeAndCatchConditionalCheckFailed } from '../entityStore/entityStoreOperationSupport.js'
import {
  latestWorkflowRunEventsPerWorkflowForAccount,
  putRunEventIfNoKeyExistsOrNewerThanExisting
} from '../entityStore/entities/GithubLatestWorkflowRunEventEntity.js'

import { GitHubAccountId, GitHubWorkflowRunEvent } from '../../types/GitHubTypes.js'

export async function saveLatestRunPerWorkflow(appState: AppState, latestRun: GitHubWorkflowRunEvent) {
  return await executeAndCatchConditionalCheckFailed(async () => {
    return await putRunEventIfNoKeyExistsOrNewerThanExisting(appState.entityStore, latestRun)
  })
}

export async function latestWorkflowRunEventsPerWorkflowForAccounts(
  appState: AppState,
  accountIds: GitHubAccountId[]
) {
  return (
    await Promise.all(
      accountIds.map(async (accountId) =>
        latestWorkflowRunEventsPerWorkflowForAccount(appState.entityStore, accountId)
      )
    )
  ).flat()
}
