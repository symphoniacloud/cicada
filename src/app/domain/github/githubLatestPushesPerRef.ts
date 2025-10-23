import { AppState } from '../../environment/AppState.js'
import { GithubPush } from '../types/GithubPush.js'
import { executeAndCatchConditionalCheckFailed } from '../entityStore/entityStoreOperationSupport.js'
import {
  putPushIfNoKeyExistsOrNewerThanExisting,
  queryRecentLatestPushesByAccount
} from '../entityStore/entities/GithubLatestPushPerRefEntity.js'
import { dateTimeAddDays } from '../../util/dateAndTime.js'
import { GitHubAccountId } from '../../types/GitHubIdTypes.js'

export async function saveLatestPushes(appState: AppState, newPushes: GithubPush[]) {
  for (const newPush of newPushes) {
    await executeAndCatchConditionalCheckFailed(async () => {
      await putPushIfNoKeyExistsOrNewerThanExisting(appState.entityStore, newPush)
    })
  }
}

export async function recentActiveBranchesForAccounts(appState: AppState, accountIds: GitHubAccountId[]) {
  const branches: GithubPush[] = []
  for (const accountId of accountIds) {
    branches.push(...(await recentActiveBranches(appState, accountId)))
  }
  return branches
}

export async function recentActiveBranches(appState: AppState, accountId: GitHubAccountId) {
  return await queryRecentLatestPushesByAccount(
    appState.entityStore,
    accountId,
    dateTimeAddDays(appState.clock.now(), -14).toISOString()
  )
}
