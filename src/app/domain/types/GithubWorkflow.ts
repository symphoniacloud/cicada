import { isStringOrUndefined } from '../../util/types.js'
import { RawGithubWorkflow } from './rawGithub/RawGithubWorkflow.js'

import { fromRawGitHubWorkflowId } from './toFromRawGitHubIds.js'
import { GitHubRepoSummary, GitHubWorkflowSummary } from '../../types/GitHubTypes.js'
import { isGitHubWorkflowSummary } from '../../types/GitHubTypeChecks.js'

export interface GithubWorkflow extends GitHubWorkflowSummary {
  workflowPath: string
  workflowState: string
  workflowUrl: string
  workflowHtmlUrl: string
  workflowBadgeUrl: string
  workflowCreatedAt: string
  workflowUpdatedAt: string
}

export function isGithubWorkflow(x: unknown): x is GithubWorkflow {
  return (
    isGitHubWorkflowSummary(x) &&
    (!('path' in x) || isStringOrUndefined(x.path)) &&
    (!('state' in x) || isStringOrUndefined(x.state)) &&
    (!('url' in x) || isStringOrUndefined(x.url)) &&
    (!('htmlUrl' in x) || isStringOrUndefined(x.htmlUrl)) &&
    (!('badgeUrl' in x) || isStringOrUndefined(x.badgeUrl)) &&
    (!('createdAt' in x) || isStringOrUndefined(x.createdAt)) &&
    (!('updatedAt' in x) || isStringOrUndefined(x.updatedAt))
  )
}

// We store more on a Workflow than we get from the Github API, so workflows can only
// be stored in the context of a repo
export function fromRawGithubWorkflow(repo: GitHubRepoSummary, raw: RawGithubWorkflow): GithubWorkflow {
  return {
    accountId: repo.accountId,
    accountName: repo.accountName,
    accountType: repo.accountType,
    repoId: repo.repoId,
    repoName: repo.repoName,
    workflowId: fromRawGitHubWorkflowId(raw.id),
    workflowName: raw.name,
    workflowPath: raw.path,
    workflowState: raw.state,
    workflowUrl: raw.url,
    workflowHtmlUrl: raw.html_url,
    workflowBadgeUrl: raw.badge_url,
    workflowCreatedAt: raw.created_at,
    workflowUpdatedAt: raw.updated_at
  }
}
