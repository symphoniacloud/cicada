import { AppState } from '../../environment/AppState'
import { GithubPush } from '../types/GithubPush'
import { executeAndCatchConditionalCheckFailed } from '../entityStore/entityStoreOperationSupport'
import {
  putPushIfNoKeyExistsOrNewerThanExisting,
  queryRecentLatestPushesByAccount
} from '../entityStore/entities/GithubLatestPushPerRefEntity'
import { dateTimeAddDays } from '../../util/dateAndTime'
import { GithubAccountId } from '../types/GithubAccountId'

export async function saveLatestPushes(appState: AppState, newPushes: GithubPush[]) {
  for (const newPush of newPushes) {
    await executeAndCatchConditionalCheckFailed(async () => {
      await putPushIfNoKeyExistsOrNewerThanExisting(appState.entityStore, newPush)
    })
  }
}

export async function recentActiveBranchesForAccounts(appState: AppState, accountIds: GithubAccountId[]) {
  const branches: GithubPush[] = []
  for (const accountId of accountIds) {
    branches.push(...(await recentActiveBranches(appState, accountId)))
  }
  return branches
}

export async function recentActiveBranches(appState: AppState, accountId: GithubAccountId) {
  return await queryRecentLatestPushesByAccount(
    appState.entityStore,
    accountId,
    dateTimeAddDays(appState.clock.now(), -14).toISOString()
  )
}
