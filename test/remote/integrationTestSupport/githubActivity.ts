import { AppState } from '../../../src/app/environment/AppState'
import { GithubAccountId } from '../../../src/app/domain/types/GithubAccountId'
import {
  batchDeleteGithubPushes,
  onlyUseInTestsGetAllGithubPushesForAccount
} from '../../../src/app/domain/entityStore/entities/GithubPushEntity'

export async function getPushesForAccount(appState: AppState, accountId: GithubAccountId) {
  return await onlyUseInTestsGetAllGithubPushesForAccount(appState.entityStore, accountId)
}

export async function deletePushesForAccount(appState: AppState, accountId: GithubAccountId) {
  await batchDeleteGithubPushes(appState.entityStore, await getPushesForAccount(appState, accountId))
}
