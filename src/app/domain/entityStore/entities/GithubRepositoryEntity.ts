import { AllEntitiesStore, DynamoDBValues } from '@symphoniacloud/dynamodb-entity-store'
import { GITHUB_REPOSITORY } from '../entityTypes.js'
import { CicadaEntity } from '../entityStoreEntitySupport.js'
import { GitHubAccountId, GitHubRepo } from '../../../ioTypes/GitHubTypes.js'
import { GitHubRepoSchema } from '../../../ioTypes/GitHubSchemas.js'

const GithubRepositoryEntity: CicadaEntity<
  GitHubRepo,
  Pick<GitHubRepo, 'accountId'>,
  Pick<GitHubRepo, 'repoId'>
> = {
  type: GITHUB_REPOSITORY,
  parse: (rawItem: DynamoDBValues) => GitHubRepoSchema.parse(rawItem),
  pk(source: Pick<GitHubRepo, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  },
  sk(source: Pick<GitHubRepo, 'repoId'>) {
    return `REPO#${source.repoId}`
  }
}

export async function putRepositories(entityStore: AllEntitiesStore, repos: GitHubRepo[]) {
  await store(entityStore).advancedOperations.batchPut(repos)
}

export async function getRepositories(
  entityStore: AllEntitiesStore,
  accountId: GitHubAccountId
): Promise<GitHubRepo[]> {
  return store(entityStore).queryAllByPk({ accountId })
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubRepositoryEntity)
}
