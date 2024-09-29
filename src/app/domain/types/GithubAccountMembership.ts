import { isNotNullObject } from '../../util/types'
import { GithubAccountId, isGithubAccountId } from './GithubAccountId'
import { GithubUserId, isGithubUserId } from './GithubUserId'

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
    isGithubAccountId(x.accountId)
  )
}
