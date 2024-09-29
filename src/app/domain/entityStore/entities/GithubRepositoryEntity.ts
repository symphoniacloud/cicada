import { AllEntitiesStore, Entity, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GithubRepository, isGithubRepository } from '../../types/GithubRepository'
import { GITHUB_REPOSITORY } from '../entityTypes'
import { GithubRepoKey } from '../../types/GithubKeys'
import { GithubAccountId } from '../../types/GithubAccountId'

export const GithubRepositoryEntity: Entity<
  GithubRepository,
  Pick<GithubRepository, 'accountId'>,
  Pick<GithubRepository, 'id'>
> = {
  type: GITHUB_REPOSITORY,
  parse: typePredicateParser(isGithubRepository, GITHUB_REPOSITORY),
  pk(source: Pick<GithubRepository, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  },
  sk(source: Pick<GithubRepository, 'id'>) {
    return `REPO#${source.id}`
  }
}

export async function putRepositories(entityStore: AllEntitiesStore, repos: GithubRepository[]) {
  await store(entityStore).advancedOperations.batchPut(repos)
}

export async function getRepository(entityStore: AllEntitiesStore, { accountId, repoId }: GithubRepoKey) {
  return store(entityStore).getOrUndefined({ accountId: accountId, id: repoId })
}

export async function getRepositories(entityStore: AllEntitiesStore, accountId: GithubAccountId) {
  return store(entityStore).queryAllByPk({ accountId })
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubRepositoryEntity)
}
