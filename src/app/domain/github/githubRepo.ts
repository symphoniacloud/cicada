import { AppState } from '../../environment/AppState.js'
import { RawGithubRepo } from '../types/rawGithub/RawGithubRepo.js'
import { fromRawGithubRepo } from '../types/GithubRepo.js'
import { getRepositories, putRepositories } from '../entityStore/entities/GithubRepositoryEntity.js'
import { GithubRepoKey } from '../types/GithubKeys.js'
import { GithubAccountId } from '../types/GithubAccountId.js'
import { GithubRepoSummary } from '../types/GithubSummaries.js'
import { accountKeysEqual, narrowToAccountSummary } from './githubAccount.js'

export function repoKeysEqual(r1: GithubRepoKey, r2: GithubRepoKey) {
  return accountKeysEqual(r1, r2) && r1.repoId === r2.repoId
}

export function narrowToRepoSummary<T extends GithubRepoSummary>(x: T): GithubRepoSummary {
  return {
    ...narrowToAccountSummary(x),
    repoId: x.repoId,
    repoName: x.repoName
  }
}

export async function processRawRepositories(appState: AppState, rawRepos: RawGithubRepo[]) {
  const repos = rawRepos.map(fromRawGithubRepo)
  // Just put *all* repos since there may have been updates to details
  await putRepositories(appState.entityStore, repos)
  return repos
}

export async function getUnarchivedRepositoriesForAccount(appState: AppState, accountId: GithubAccountId) {
  return (await getRepositories(appState.entityStore, accountId)).filter(({ archived }) => !archived)
}
