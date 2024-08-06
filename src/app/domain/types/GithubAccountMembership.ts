import { GithubAccountId, GithubUserId, isGithubUserId } from './GithubKeys'
import { isNotNullObject } from '../../util/types'

export interface GithubAccountMembership {
  userId: GithubUserId
  accountId: GithubAccountId
}

export function isGithubOrganizationMembership(x: unknown): x is GithubAccountMembership {
  return (
    isNotNullObject(x) &&
    'userId' in x &&
    isGithubUserId(x.userId) &&
    'accountId' in x &&
    isGithubUserId(x.accountId)
  )
}
