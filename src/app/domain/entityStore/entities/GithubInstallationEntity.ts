import { entityFromPkOnlyEntity, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GithubInstallation, isGithubInstallation } from '../../types/GithubInstallation'
import { GITHUB_INSTALLATION } from '../entityTypes'

export const GithubInstallationEntity = entityFromPkOnlyEntity({
  type: GITHUB_INSTALLATION,
  parse: typePredicateParser(isGithubInstallation, GITHUB_INSTALLATION),
  pk(source: Pick<GithubInstallation, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  }
})
