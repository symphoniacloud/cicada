import { entityFromPkOnlyEntity, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GITHUB_USER_TOKEN } from '../entityTypes'
import { GithubUserToken, isGithubUserToken } from '../../types/GithubUserToken'

export const GithubUserTokenEntity = entityFromPkOnlyEntity({
  type: GITHUB_USER_TOKEN,
  parse: typePredicateParser(isGithubUserToken, GITHUB_USER_TOKEN),
  pk(source: Pick<GithubUserToken, 'token'>) {
    return `USER_TOKEN#${source.token}`
  }
})
