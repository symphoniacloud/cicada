import { AppState } from '../../environment/AppState'
import { RawGithubRepo } from '../types/rawGithub/RawGithubRepo'
import { fromRawGithubRepo } from '../types/GithubRepo'
import { getRepositories, putRepositories } from '../entityStore/entities/GithubRepositoryEntity'
import { GithubRepoKey } from '../types/GithubKeys'
import { GithubAccountId } from '../types/GithubAccountId'
import { GithubRepoSummary } from '../types/GithubSummaries'
import { accountKeysEqual, toAccountSummary } from './githubAccount'

export function repoKeysEqual(r1: GithubRepoKey, r2: GithubRepoKey) {
  return accountKeysEqual(r1, r2) && r1.repoId === r2.repoId
}

export function toRepoSummary<T extends GithubRepoSummary>(x: T): GithubRepoSummary {
  return {
    ...toAccountSummary(x),
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
