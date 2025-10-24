import { AllEntitiesStore, DynamoDBValues } from '@symphoniacloud/dynamodb-entity-store'
import { GITHUB_USER_TOKEN } from '../entityTypes.js'
import { cicadaEntityFromPkOnlyEntity } from '../entityStoreEntitySupport.js'
import { GitHubUserToken } from '../../../ioTypes/GitHubTypes.js'
import { GitHubUserTokenSchema } from '../../../ioTypes/GitHubSchemas.js'

const GithubUserTokenEntity = cicadaEntityFromPkOnlyEntity({
  type: GITHUB_USER_TOKEN,
  parse: (rawItem: DynamoDBValues) => GitHubUserTokenSchema.parse(rawItem),
  pk(source: Pick<GitHubUserToken, 'token'>) {
    return `USER_TOKEN#${source.token}`
  }
})

export async function putGithubUserToken(
  entityStore: AllEntitiesStore,
  userToken: GitHubUserToken,
  ttlInFutureDays: number
) {
  return await store(entityStore).put(userToken, { ttlInFutureDays })
}

export async function getGithubUserToken(entityStore: AllEntitiesStore, token: string) {
  return await store(entityStore).getOrUndefined({ token })
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubUserTokenEntity)
}
