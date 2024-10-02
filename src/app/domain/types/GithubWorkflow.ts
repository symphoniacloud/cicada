import { GithubWorkflowSummary, isGithubWorkflowSummary } from './GithubSummaries'
import { isStringOrUndefined } from '../../util/types'

export interface GithubWorkflow extends GithubWorkflowSummary {
  // Not available on all source data from GitHub
  workflowHtmlUrl?: string
  workflowBadgeUrl?: string
}

export function isGithubWorkflow(x: unknown): x is GithubWorkflow {
  return (
    isGithubWorkflowSummary(x) &&
    (!('workflowHtmlUrl' in x) || isStringOrUndefined(x.workflowHtmlUrl)) &&
    (!('workflowBadgeUrl' in x) || isStringOrUndefined(x.workflowBadgeUrl))
  )
}
