import { isNotNullObject } from '../../util/types.js'
import { GithubUserId, isGithubUserId } from './GithubUserId.js'
import { GitHubAccountId, isGitHubAccountId } from '../../types/GitHubIdTypes.js'

export interface GithubAccountMembership {
  userId: GithubUserId
  accountId: GitHubAccountId
}

export function isGithubOrganizationMembership(x: unknown): x is GithubAccountMembership {
  return (
    isNotNullObject(x) &&
    'userId' in x &&
    isGithubUserId(x.userId) &&
    'accountId' in x &&
    isGitHubAccountId(x.accountId)
  )
}
