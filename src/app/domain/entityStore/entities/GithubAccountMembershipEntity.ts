import { Entity, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GithubAccountMembership, isGithubOrganizationMembership } from '../../types/GithubAccountMembership'
import { GITHUB_ACCOUNT_MEMBERSHIP } from '../entityTypes'

export const GithubAccountMembershipEntity: Entity<
  GithubAccountMembership,
  Pick<GithubAccountMembership, 'accountId'>,
  Pick<GithubAccountMembership, 'userId'>
> = {
  type: GITHUB_ACCOUNT_MEMBERSHIP,
  parse: typePredicateParser(isGithubOrganizationMembership, GITHUB_ACCOUNT_MEMBERSHIP),
  pk(source: Pick<GithubAccountMembership, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  },
  sk(source: Pick<GithubAccountMembership, 'userId'>) {
    return `USER#${source.userId}`
  },
  gsis: {
    gsi1: {
      pk(source: Pick<GithubAccountMembership, 'userId'>) {
        return `USER#${source.userId}`
      },
      sk(source: Pick<GithubAccountMembership, 'accountId'>) {
        return `ACCOUNT#${source.accountId}`
      }
    }
  }
}
