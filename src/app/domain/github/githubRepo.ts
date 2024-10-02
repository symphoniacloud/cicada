import { AppState } from '../../environment/AppState'
import { RawGithubRepo } from '../types/rawGithub/RawGithubRepo'
import { fromRawGithubRepo, GithubRepo } from '../types/GithubRepo'
import { getRepositories, putRepositories } from '../entityStore/entities/GithubRepositoryEntity'
import { GithubRepoKey } from '../types/GithubKeys'
import { GithubAccountId } from '../types/GithubAccountId'
import { GithubRepoSummary } from '../types/GithubSummaries'
import { isSameAccount } from './githubAccount'

export function isSameRepo(r1: GithubRepoKey, r2: GithubRepoKey) {
  return isSameAccount(r1, r2) && r1.repoId === r2.repoId
}

export async function processRawRepositories(appState: AppState, rawRepos: RawGithubRepo[]) {
  return await saveRepositories(appState, rawRepos.map(fromRawGithubRepo))
}

async function saveRepositories(appState: AppState, repos: GithubRepo[]) {
  // Just put all repos since there may have been updates to details
  await putRepositories(appState.entityStore, repos)
  return repos
}

export async function getRepositoriesForAccount(appState: AppState, accountId: GithubAccountId) {
  return (await getRepositories(appState.entityStore, accountId)).filter(({ archived }) => !archived)
}

export function toUniqueRepoIdsForAccount(repos: GithubRepoKey[], accountId: GithubAccountId) {
  return [...new Set(repos.filter((repo) => repo.accountId === accountId).map((repo) => repo.repoId))]
}

export function findUniqueAccountIds(repos: GithubRepoKey[]) {
  return [...new Set(repos.map((repo) => repo.accountId))]
}

export function findAccountNameFromRepositories(repos: GithubRepoSummary[], accountId: GithubAccountId) {
  const repoInAccount = repos.find((r) => r.accountId === accountId)
  // TODO - this will actually occur if we remove the account from Cicada, so need to handle
  if (!repoInAccount) throw new Error(`Unable to find a repo for accountId ${accountId}`)
  return repoInAccount.accountName
}

export function findRepoNameFromRepositories(
  repos: GithubRepoSummary[],
  { accountId, repoId }: GithubRepoKey
) {
  const repo = repos.find((repo) => repo.accountId === accountId && repo.repoId === repoId)
  // TODO - this will actually occur if the repo is removed from Cicada, so need to handle
  if (!repo) throw new Error(`Unable to find a repo for accountId ${accountId}, repoId ${repoId}`)
  return repo.repoName
}
