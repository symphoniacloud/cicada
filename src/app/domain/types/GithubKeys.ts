import { isNotNullObject } from '../../util/types'
import { GithubAccountId, isGithubAccountId } from './GithubAccountId'
import { GithubRepoId, isGithubRepoId } from './GithubRepoId'
import { GithubWorkflowId, isGithubWorkflowId } from './GithubWorkflowId'

export interface GithubAccountKey {
  accountId: GithubAccountId
}

export interface GithubRepoKey extends GithubAccountKey {
  repoId: GithubRepoId
}

export interface GithubWorkflowKey extends GithubRepoKey {
  workflowId: GithubWorkflowId
}

export function isGithubAccountKey(x: unknown): x is GithubAccountKey {
  return isNotNullObject(x) && 'accountId' in x && isGithubAccountId(x.accountId)
}

export function isGithubRepoKey(x: unknown): x is GithubRepoKey {
  return isGithubAccountKey(x) && 'repoId' in x && isGithubRepoId(x.repoId)
}

export function isGithubWorkflowKey(x: unknown): x is GithubWorkflowKey {
  return isGithubRepoKey(x) && 'workflowId' in x && isGithubWorkflowId(x.workflowId)
}
