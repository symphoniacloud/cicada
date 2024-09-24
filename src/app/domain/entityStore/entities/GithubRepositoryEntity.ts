import { AllEntitiesStore, Entity, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GithubRepository, isGithubRepository } from '../../types/GithubRepository'
import { GITHUB_REPOSITORY } from '../entityTypes'
import { GithubAccountId, GithubRepoKey } from '../../types/GithubKeys'

export const GithubRepositoryEntity: Entity<
  GithubRepository,
  Pick<GithubRepository, 'ownerId'>,
  Pick<GithubRepository, 'id'>
> = {
  type: GITHUB_REPOSITORY,
  parse: typePredicateParser(isGithubRepository, GITHUB_REPOSITORY),
  pk(source: Pick<GithubRepository, 'ownerId'>) {
    return `OWNER#${source.ownerId}`
  },
  sk(source: Pick<GithubRepository, 'id'>) {
    return `REPO#${source.id}`
  }
}

export async function putRepositories(entityStore: AllEntitiesStore, repos: GithubRepository[]) {
  await store(entityStore).advancedOperations.batchPut(repos)
}

export async function getRepository(entityStore: AllEntitiesStore, { ownerId, repoId }: GithubRepoKey) {
  return store(entityStore).getOrUndefined({ ownerId, id: repoId })
}

export async function getRepositories(entityStore: AllEntitiesStore, ownerId: GithubAccountId) {
  return store(entityStore).queryAllByPk({ ownerId })
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubRepositoryEntity)
}
