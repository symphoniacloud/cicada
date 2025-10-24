import { AllEntitiesStore, DynamoDBValues } from '@symphoniacloud/dynamodb-entity-store'
import { GITHUB_USER } from '../entityTypes.js'
import { cicadaEntityFromPkOnlyEntity } from '../entityStoreEntitySupport.js'

import { GitHubUser, GitHubUserId } from '../../../ioTypes/GitHubTypes.js'
import { GitHubUserSchema } from '../../../ioTypes/GitHubSchemas.js'

const GithubUserEntity = cicadaEntityFromPkOnlyEntity({
  type: GITHUB_USER,
  parse: (rawItem: DynamoDBValues) => GitHubUserSchema.parse(rawItem),
  pk(source: Pick<GitHubUser, 'userId'>) {
    return `USER#${source.userId}`
  }
})

export async function batchPutUsers(entityStore: AllEntitiesStore, users: GitHubUser[]) {
  await store(entityStore).advancedOperations.batchPut(users)
}

export async function getUserById(
  entityStore: AllEntitiesStore,
  userId: GitHubUserId
): Promise<GitHubUser | undefined> {
  return store(entityStore).getOrUndefined({ userId })
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubUserEntity)
}
