import { AppState } from '../../../src/app/environment/AppState.js'
import {
  batchDeleteGithubPushes,
  onlyUseInTestsGetAllGithubPushesForAccount
} from '../../../src/app/domain/entityStore/entities/GithubPushEntity.js'

import { GitHubAccountId } from '../../../src/app/ioTypes/GitHubTypes.js'

export async function getPushesForAccount(appState: AppState, accountId: GitHubAccountId) {
  return await onlyUseInTestsGetAllGithubPushesForAccount(appState.entityStore, accountId)
}

export async function deletePushesForAccount(appState: AppState, accountId: GitHubAccountId) {
  await batchDeleteGithubPushes(appState.entityStore, await getPushesForAccount(appState, accountId))
}
