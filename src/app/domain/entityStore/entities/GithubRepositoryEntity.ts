import { AllEntitiesStore, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GithubRepo, isGithubRepo } from '../../types/GithubRepo.js'
import { GITHUB_REPOSITORY } from '../entityTypes.js'
import { CicadaEntity } from '../entityStoreEntitySupport.js'
import { GitHubAccountId } from '../../../types/GitHubTypes.js'

const GithubRepositoryEntity: CicadaEntity<
  GithubRepo,
  Pick<GithubRepo, 'accountId'>,
  Pick<GithubRepo, 'repoId'>
> = {
  type: GITHUB_REPOSITORY,
  parse: typePredicateParser(isGithubRepo, GITHUB_REPOSITORY),
  pk(source: Pick<GithubRepo, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  },
  sk(source: Pick<GithubRepo, 'repoId'>) {
    return `REPO#${source.repoId}`
  }
}

export async function putRepositories(entityStore: AllEntitiesStore, repos: GithubRepo[]) {
  await store(entityStore).advancedOperations.batchPut(repos)
}

export async function getRepositories(
  entityStore: AllEntitiesStore,
  accountId: GitHubAccountId
): Promise<GithubRepo[]> {
  return store(entityStore).queryAllByPk({ accountId })
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubRepositoryEntity)
}
