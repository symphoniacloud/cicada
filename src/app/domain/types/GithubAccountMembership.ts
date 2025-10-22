import { isNotNullObject } from '../../util/types.js'
import { GithubAccountId, isGithubAccountId } from './GithubAccountId.js'
import { GithubUserId, isGithubUserId } from './GithubUserId.js'

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
