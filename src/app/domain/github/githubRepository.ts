import { AppState } from '../../environment/AppState'
import { RawGithubRepository } from '../types/rawGithub/RawGithubRepository'
import { fromRawGithubRepository, GithubRepository, GithubRepositorySummary } from '../types/GithubRepository'
import { GithubRepositoryEntity } from '../entityStore/entities/GithubRepositoryEntity'

export async function processRawRepositories(appState: AppState, rawRepos: RawGithubRepository[]) {
  return await saveRepositories(appState, rawRepos.map(fromRawGithubRepository))
}

async function saveRepositories(appState: AppState, repos: GithubRepository[]) {
  // Just put all repos since there may have been updates to details
  await appState.entityStore.for(GithubRepositoryEntity).advancedOperations.batchPut(repos)
  return repos
}

export async function getRepository(appState: AppState, accountId: number, repoId: number) {
  return appState.entityStore.for(GithubRepositoryEntity).getOrUndefined({ ownerId: accountId, id: repoId })
}

export function toRepositorySummary({
  id,
  name,
  ownerId,
  ownerName,
  ownerType
}: GithubRepository): GithubRepositorySummary {
  return {
    id,
    name,
    ownerId,
    ownerName,
    ownerType
  }
}
