import { isNotNullObject, isNumber } from '../../util/types'

export type GithubAccountId = number
export type GithubRepoId = number
export type GithubWorkflowId = number
export type GithubUserId = number
export type GithubInstallationId = number
export type GithubAppId = number

export interface GithubAccountKey {
  accountId: GithubAccountId
}

export interface GithubRepoKey extends GithubAccountKey {
  repoId: GithubRepoId
}

export interface GithubWorkflowKey extends GithubRepoKey {
  workflowId: GithubWorkflowId
}

export const isGithubAccountId = isNumber
export const isGithubRepoId = isNumber
export const isGithubWorkflowId = isNumber
export const isGithubUserId = isNumber
export const isGithubInstallationId = isNumber
export const isGithubAppId = isNumber

export function isGithubAccountKey(x: unknown): x is GithubAccountKey {
  return isNotNullObject(x) && 'accountId' in x && isGithubAccountId(x.accountId)
}

export function isGithubRepoKey(x: unknown): x is GithubRepoKey {
  return isGithubAccountKey(x) && 'repoId' in x && isGithubRepoId(x.repoId)
}

export function isGithubWorkflowKey(x: unknown): x is GithubWorkflowKey {
  return isGithubRepoKey(x) && 'workflowId' in x && isGithubWorkflowId(x.workflowId)
}
