import { isNotNullObject } from '../../util/types.js'
import { GithubRepoId, isGithubRepoId } from './GithubRepoId.js'
import { GithubWorkflowId, isGithubWorkflowId } from './GithubWorkflowId.js'
import { GithubUserId, isGithubUserId } from './GithubUserId.js'
import { GitHubAccountId, isGitHubAccountId } from '../../types/GitHubIdTypes.js'

export interface GithubAccountKey {
  accountId: GitHubAccountId
}

export interface GithubRepoKey extends GithubAccountKey {
  repoId: GithubRepoId
}

export interface GithubWorkflowKey extends GithubRepoKey {
  workflowId: GithubWorkflowId
}

export interface GithubUserKey {
  userId: GithubUserId
}

export function isGithubAccountKey(x: unknown): x is GithubAccountKey {
  return isNotNullObject(x) && 'accountId' in x && isGitHubAccountId(x.accountId)
}

export function isGithubRepoKey(x: unknown): x is GithubRepoKey {
  return isGithubAccountKey(x) && 'repoId' in x && isGithubRepoId(x.repoId)
}

export function isGithubWorkflowKey(x: unknown): x is GithubWorkflowKey {
  return isGithubRepoKey(x) && 'workflowId' in x && isGithubWorkflowId(x.workflowId)
}

export function isGithubUserKey(x: unknown): x is GithubUserKey {
  return isNotNullObject(x) && 'userId' in x && isGithubUserId(x.userId)
}
