import { AppState } from '../../environment/AppState'
import { RawGithubRepository } from '../types/rawGithub/RawGithubRepository'
import { fromRawGithubRepository, GithubRepository, GithubRepositorySummary } from '../types/GithubRepository'
import { getRepositories, putRepositories } from '../entityStore/entities/GithubRepositoryEntity'
import { GithubAccountId, GithubRepoKey } from '../types/GithubKeys'

export async function processRawRepositories(appState: AppState, rawRepos: RawGithubRepository[]) {
  return await saveRepositories(appState, rawRepos.map(fromRawGithubRepository))
}

async function saveRepositories(appState: AppState, repos: GithubRepository[]) {
  // Just put all repos since there may have been updates to details
  await putRepositories(appState.entityStore, repos)
  return repos
}

export async function getRepositoriesForAccount(appState: AppState, ownerId: GithubAccountId) {
  return (await getRepositories(appState.entityStore, ownerId)).filter(({ archived }) => !archived)
}

export function toUniqueRepoIdsForAccount(repos: GithubRepoKey[], accountId: GithubAccountId) {
  return [...new Set(repos.filter((repo) => repo.ownerId === accountId).map((repo) => repo.repoId))]
}

export function findUniqueAccountIds(repos: GithubRepoKey[]) {
  return [...new Set(repos.map((repo) => repo.ownerId))]
}

export function repositorySummaryToKey(repo: GithubRepositorySummary): GithubRepoKey {
  return {
    ownerId: repo.ownerId,
    repoId: repo.id
  }
}

export function findAccountNameFromRepositories(repos: GithubRepositorySummary[], ownerId: GithubAccountId) {
  const repoInAccount = repos.find((r) => r.ownerId === ownerId)
  // TODO - this will actually occur if we remove the account from Cicada, so need to handle
  if (!repoInAccount) throw new Error(`Unable to find a repo for accountId ${ownerId}`)
  return repoInAccount.ownerName
}

export function findRepoNameFromRepositories(
  repos: GithubRepositorySummary[],
  { ownerId, repoId }: GithubRepoKey
) {
  const repo = repos.find((repo) => repo.ownerId === ownerId && repo.id === repoId)
  // TODO - this will actually occur if the repo is removed from Cicada, so need to handle
  if (!repo) throw new Error(`Unable to find a repo for ownerId ${ownerId}, repoId ${repoId}`)
  return repo.name
}
