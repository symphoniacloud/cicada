import { GithubRepositoryElement, isGithubRepositoryElement } from './GithubElements'
import { GithubWorkflowKey, isGithubWorkflowKey } from './GithubKeys'

export interface GithubWorkflow extends GithubWorkflowKey, GithubRepositoryElement {
  workflowName?: string
  // Not available on all source data from GitHub
  workflowHtmlUrl?: string
  workflowBadgeUrl?: string
}

export function isGithubWorkflow(x: unknown): x is GithubWorkflow {
  return isGithubWorkflowKey(x) && isGithubRepositoryElement(x)
}
