import { RawGithubWorkflowRunEvent } from './rawGithub/RawGithubWorkflowRunEvent'
import { fromRawAccountType } from './GithubAccountType'
import { GithubWorkflow, isGithubWorkflow } from './GithubWorkflow'
import { fromRawGithubAccountId } from './GithubAccountId'
import { fromRawGithubRepoId } from './GithubRepoId'
import { fromRawGithubWorkflowId } from './GithubWorkflowId'
import { fromRawGithubUserId } from './GithubUserId'
import { GithubUserSummary, isGithubUserSummary } from './GithubSummaries'
import { fromRawGithubWorkflowRunId, GithubWorkflowRunId, isGithubWorkflowRunId } from './GithubWorkflowRunId'
import { isString } from '../../util/types'

export interface GithubWorkflowRunEvent extends GithubWorkflow {
  repoHtmlUrl: string
  workflowRunId: GithubWorkflowRunId
  runNumber: number
  runAttempt?: number
  displayTitle: string
  event: string
  status?: string
  headBranch?: string
  headSha: string
  conclusion?: string
  createdAt: string
  updatedAt: string
  runStartedAt?: string
  htmlUrl: string
  // TOEventually - what happens here for a manual push? Do we still get an actor?
  actor?: GithubWorkflowRunEventActor
}

export interface GithubWorkflowRunEventActor extends GithubUserSummary {
  avatarUrl: string
  htmlUrl: string
}

export function isGithubWorkflowRunEvent(x: unknown): x is GithubWorkflowRunEvent {
  return (
    isGithubWorkflow(x) &&
    'repoHtmlUrl' in x &&
    isString(x.repoHtmlUrl) &&
    'workflowRunId' in x &&
    isGithubWorkflowRunId(x.workflowRunId) &&
    'runNumber' in x &&
    'event' in x &&
    'headSha' in x &&
    'createdAt' in x &&
    'updatedAt' in x &&
    'htmlUrl' in x &&
    'workflowRunId' in x &&
    (!('actor' in x) || isGithubWorkflowRunEventActor(x.actor))
  )
}

export function isGithubWorkflowRunEventActor(x: unknown): x is GithubWorkflowRunEventActor {
  return (
    isGithubUserSummary(x) &&
    'avatarUrl' in x &&
    isString(x.avatarUrl) &&
    'htmlUrl' in x &&
    isString(x.htmlUrl)
  )
}

// TOEventually - consider dateTimes, e.g. for Pushes we get localized times
export function fromRawGithubWorkflowRunEvent(raw: RawGithubWorkflowRunEvent): GithubWorkflowRunEvent {
  return {
    accountId: fromRawGithubAccountId(raw.repository.owner.id),
    accountName: raw.repository.owner.login,
    accountType: fromRawAccountType(raw.repository.owner.type),
    repoId: fromRawGithubRepoId(raw.repository.id),
    repoName: raw.repository.name,
    workflowId: fromRawGithubWorkflowId(raw.workflow_id),
    path: raw.path,
    workflowName: raw.name ?? raw.workflow?.name ?? undefined,
    workflowRunId: fromRawGithubWorkflowRunId(raw.id),
    repoHtmlUrl: raw.repository.html_url,
    runNumber: raw.run_number,
    runAttempt: raw.run_attempt,
    event: raw.event,
    displayTitle: raw.display_title,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    runStartedAt: raw.run_started_at,
    status: raw.status ?? undefined,
    workflowHtmlUrl: raw.workflow?.html_url,
    workflowBadgeUrl: raw.workflow?.badge_url,
    conclusion: raw.conclusion ?? undefined,
    headBranch: raw.head_branch ?? undefined,
    htmlUrl: raw.html_url,
    headSha: raw.head_sha,
    ...(raw.actor
      ? {
          actor: {
            userId: fromRawGithubUserId(raw.actor.id),
            userName: raw.actor.login,
            avatarUrl: raw.actor.avatar_url,
            htmlUrl: raw.actor.html_url
          }
        }
      : {})
  }
}
