import { AllEntitiesStore, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GITHUB_USER_TOKEN } from '../entityTypes'
import { GithubUserToken, isGithubUserToken } from '../../types/GithubUserToken'
import { cicadaEntityFromPkOnlyEntity } from '../entityStoreEntitySupport'

const GithubUserTokenEntity = cicadaEntityFromPkOnlyEntity({
  type: GITHUB_USER_TOKEN,
  parse: typePredicateParser(isGithubUserToken, GITHUB_USER_TOKEN),
  pk(source: Pick<GithubUserToken, 'token'>) {
    return `USER_TOKEN#${source.token}`
  }
})

export async function putGithubUserToken(
  entityStore: AllEntitiesStore,
  userToken: GithubUserToken,
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
