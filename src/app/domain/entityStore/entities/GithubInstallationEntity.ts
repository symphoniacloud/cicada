import { AllEntitiesStore, DynamoDBValues } from '@symphoniacloud/dynamodb-entity-store'
import { GITHUB_INSTALLATION } from '../entityTypes.js'
import { cicadaEntityFromPkOnlyEntity } from '../entityStoreEntitySupport.js'
import { GitHubAccountId, GitHubInstallation } from '../../../ioTypes/GitHubTypes.js'
import { GitHubInstallationSchema } from '../../../ioTypes/GitHubSchemas.js'

const GithubInstallationEntity = cicadaEntityFromPkOnlyEntity({
  type: GITHUB_INSTALLATION,
  parse: (rawItem: DynamoDBValues) => GitHubInstallationSchema.parse(rawItem),
  pk(source: Pick<GitHubInstallation, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  }
})

export async function putInstallation(
  entityStore: AllEntitiesStore,
  installation: GitHubInstallation
): Promise<GitHubInstallation> {
  return store(entityStore).put(installation)
}

export async function getInstallationOrUndefined(
  entityStore: AllEntitiesStore,
  accountId: GitHubAccountId
): Promise<GitHubInstallation | undefined> {
  return store(entityStore).getOrUndefined({ accountId })
}

export async function getInstallationOrThrow(
  entityStore: AllEntitiesStore,
  accountId: GitHubAccountId
): Promise<GitHubInstallation> {
  return store(entityStore).getOrThrow({ accountId })
}

export async function getAllInstallations(entityStore: AllEntitiesStore): Promise<GitHubInstallation[]> {
  return store(entityStore).scanAll()
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubInstallationEntity)
}
