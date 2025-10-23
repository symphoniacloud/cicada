import { isNotNullObject } from '../../util/types.js'
import {
  GitHubAccountId,
  GitHubRepoId,
  GitHubUserId,
  GitHubWorkflowId,
  isGitHubAccountId,
  isGitHubRepoId,
  isGitHubUserId,
  isGitHubWorkflowId
} from '../../types/GitHubIdTypes.js'

export interface GithubAccountKey {
  accountId: GitHubAccountId
}

export interface GithubRepoKey extends GithubAccountKey {
  repoId: GitHubRepoId
}

export interface GithubWorkflowKey extends GithubRepoKey {
  workflowId: GitHubWorkflowId
}

export interface GithubUserKey {
  userId: GitHubUserId
}

export function isGithubAccountKey(x: unknown): x is GithubAccountKey {
  return isNotNullObject(x) && 'accountId' in x && isGitHubAccountId(x.accountId)
}

export function isGithubRepoKey(x: unknown): x is GithubRepoKey {
  return isGithubAccountKey(x) && 'repoId' in x && isGitHubRepoId(x.repoId)
}

export function isGithubWorkflowKey(x: unknown): x is GithubWorkflowKey {
  return isGithubRepoKey(x) && 'workflowId' in x && isGitHubWorkflowId(x.workflowId)
}

export function isGithubUserKey(x: unknown): x is GithubUserKey {
  return isNotNullObject(x) && 'userId' in x && isGitHubUserId(x.userId)
}
