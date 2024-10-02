import { RawGithubWorkflowRunEvent } from './rawGithub/RawGithubWorkflowRunEvent'
import { fromRawAccountType } from './GithubAccountType'
import { GithubWorkflow, isGithubWorkflow } from './GithubWorkflow'
import { fromRawGithubAccountId } from './GithubAccountId'
import { fromRawGithubRepoId } from './GithubRepoId'
import { fromRawGithubWorkflowId } from './GithubWorkflowId'
import { fromRawGithubUserId } from './GithubUserId'
import { GithubUserSummary } from './GithubSummaries'

export interface GithubWorkflowRunEvent extends GithubWorkflow {
  repoHtmlUrl: string
  // TODO - change ID here
  id: number
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
  if (!isGithubWorkflow(x)) return false

  const candidate = x as GithubWorkflowRunEvent
  // TOEventually - actually check type of fields, e.g. with AJV
  return (
    candidate.repoHtmlUrl !== undefined &&
    candidate.id !== undefined &&
    candidate.runNumber !== undefined &&
    candidate.displayTitle !== undefined &&
    candidate.event !== undefined &&
    candidate.headSha !== undefined &&
    candidate.createdAt !== undefined &&
    candidate.updatedAt !== undefined &&
    candidate.htmlUrl !== undefined &&
    (candidate.actor === undefined ||
      (candidate.actor.userName !== undefined &&
        candidate.actor.userId !== undefined &&
        candidate.actor.avatarUrl !== undefined &&
        candidate.actor.htmlUrl !== undefined))
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
    id: raw.id,
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
