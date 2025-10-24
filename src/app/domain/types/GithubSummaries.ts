import { isString } from '../../util/types.js'
import { GithubAccountType, isGithubAccountType } from './GithubAccountType.js'
import { GitHubAccountKey, GitHubRepoKey, GitHubUserKey, GitHubWorkflowKey } from '../../types/GitHubTypes.js'
import {
  isGitHubAccountKey,
  isGitHubRepoKey,
  isGitHubUserKey,
  isGitHubWorkflowKey
} from '../../types/GitHubTypeChecks.js'

export interface GithubAccountSummary extends GitHubAccountKey {
  accountName: string
  accountType: GithubAccountType
}

export function isGithubAccountSummary(x: unknown): x is GithubAccountSummary {
  return (
    isGitHubAccountKey(x) &&
    'accountName' in x &&
    isString(x.accountName) &&
    'accountType' in x &&
    isGithubAccountType(x.accountType)
  )
}

export interface GithubRepoSummary extends GitHubRepoKey, GithubAccountSummary {
  repoName: string
}

export function isGithubRepoSummary(x: unknown): x is GithubRepoSummary {
  return isGitHubRepoKey(x) && isGithubAccountSummary(x) && 'repoName' in x && isString(x.repoName)
}

export interface GithubWorkflowSummary extends GitHubWorkflowKey, GithubRepoSummary {
  workflowName: string
}

export function isGithubWorkflowSummary(x: unknown): x is GithubWorkflowSummary {
  return isGitHubWorkflowKey(x) && isGithubRepoSummary(x) && 'workflowName' in x && isString(x.workflowName)
}

export interface GithubUserSummary extends GitHubUserKey {
  userName: string
}

export function isGithubUserSummary(x: unknown): x is GithubUserSummary {
  return isGitHubUserKey(x) && 'userName' in x && isString(x.userName)
}
