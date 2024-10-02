import { isString, isStringOrUndefined } from '../../util/types'
import {
  GithubAccountKey,
  GithubRepoKey,
  GithubUserKey,
  GithubWorkflowKey,
  isGithubAccountKey,
  isGithubRepoKey,
  isGithubUserKey,
  isGithubWorkflowKey
} from './GithubKeys'
import { GithubAccountType, isGithubAccountType } from './GithubAccountType'

export interface GithubAccountSummary extends GithubAccountKey {
  accountName: string
  accountType: GithubAccountType
}

export function isGithubAccountSummary(x: unknown): x is GithubAccountSummary {
  return (
    isGithubAccountKey(x) &&
    'accountName' in x &&
    isString(x.accountName) &&
    'accountType' in x &&
    isGithubAccountType(x.accountType)
  )
}

export interface GithubRepoSummary extends GithubRepoKey, GithubAccountSummary {
  repoName: string
}

export function isGithubRepoSummary(x: unknown): x is GithubRepoSummary {
  return isGithubRepoKey(x) && isGithubAccountSummary(x) && 'repoName' in x && isString(x.repoName)
}

export interface GithubWorkflowSummary extends GithubWorkflowKey, GithubRepoSummary {
  path: string
  // Workflow name is not available on all source data from github - sometimes path is used
  workflowName?: string
}

export function isGithubWorkflowSummary(x: unknown): x is GithubWorkflowSummary {
  return (
    isGithubWorkflowKey(x) &&
    isGithubRepoSummary(x) &&
    'path' in x &&
    isString(x.path) &&
    (!('workflowName' in x) || isStringOrUndefined(x.workflowName))
  )
}

export interface GithubUserSummary extends GithubUserKey {
  userName: string
}

export function isGithubUserSummary(x: unknown): x is GithubUserSummary {
  return isGithubUserKey(x) && 'userName' in x && isString(x.userName)
}
