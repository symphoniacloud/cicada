import { entityFromPkOnlyEntity, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GithubUser, isGithubUser } from '../../types/GithubUser'
import { GITHUB_USER } from '../entityTypes'

export const GithubUserEntity = entityFromPkOnlyEntity({
  type: GITHUB_USER,
  parse: typePredicateParser(isGithubUser, GITHUB_USER),
  pk(source: Pick<GithubUser, 'id'>) {
    return `USER#${source.id}`
  }
})
