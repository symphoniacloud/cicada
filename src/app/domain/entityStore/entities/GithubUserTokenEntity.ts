import { AllEntitiesStore, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GITHUB_USER_TOKEN } from '../entityTypes.js'
import { cicadaEntityFromPkOnlyEntity } from '../entityStoreEntitySupport.js'
import { GitHubUserToken } from '../../../types/GitHubTypes.js'
import { isGitHubUserToken } from '../../../types/GitHubTypeChecks.js'

const GithubUserTokenEntity = cicadaEntityFromPkOnlyEntity({
  type: GITHUB_USER_TOKEN,
  parse: typePredicateParser(isGitHubUserToken, GITHUB_USER_TOKEN),
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
