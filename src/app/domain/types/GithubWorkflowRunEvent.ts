import { RawGithubWorkflowRunEvent } from './rawGithub/RawGithubWorkflowRunEvent'
import { fromRawAccountType } from './githubCommonTypes'
import { GithubRepositoryElement } from './GithubRepositoryElement'

export interface GithubWorkflowRunEvent extends GithubRepositoryElement {
  repoHtmlUrl: string
  workflowId: number
  workflowName?: string
  path: string
  // Not available on all source data from GitHub
  workflowHtmlUrl?: string
  workflowBadgeUrl?: string
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
  actor?: { login: string; id: number; avatarUrl: string; htmlUrl: string }
}

export function isGithubWorkflowRunEvent(x: unknown): x is GithubWorkflowRunEvent {
  const candidate = x as GithubWorkflowRunEvent
  // TOEventually - actually check type of fields, e.g. with AJV
  return (
    candidate.ownerId !== undefined &&
    candidate.ownerName !== undefined &&
    candidate.ownerType !== undefined &&
    candidate.repoId !== undefined &&
    candidate.repoName !== undefined &&
    candidate.repoHtmlUrl !== undefined &&
    candidate.workflowId !== undefined &&
    candidate.path !== undefined &&
    candidate.id !== undefined &&
    candidate.runNumber !== undefined &&
    candidate.displayTitle !== undefined &&
    candidate.event !== undefined &&
    candidate.headSha !== undefined &&
    candidate.createdAt !== undefined &&
    candidate.updatedAt !== undefined &&
    candidate.htmlUrl !== undefined &&
    (candidate.actor === undefined ||
      (candidate.actor.login !== undefined &&
        candidate.actor.id !== undefined &&
        candidate.actor.avatarUrl !== undefined &&
        candidate.actor.htmlUrl !== undefined))
  )
}

// TOEventually - consider dateTimes, e.g. for Pushes we get localized times
export function fromRawGithubWorkflowRunEvent(raw: RawGithubWorkflowRunEvent): GithubWorkflowRunEvent {
  return {
    ownerId: raw.repository.owner.id,
    ownerName: raw.repository.owner.login,
    ownerType: fromRawAccountType(raw.repository.owner.type),
    repoId: raw.repository.id,
    repoName: raw.repository.name,
    repoHtmlUrl: raw.repository.html_url,
    workflowId: raw.workflow_id,
    id: raw.id,
    runNumber: raw.run_number,
    runAttempt: raw.run_attempt,
    event: raw.event,
    path: raw.path,
    displayTitle: raw.display_title,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    runStartedAt: raw.run_started_at,
    status: raw.status ?? undefined,
    workflowName: raw.name ?? raw.workflow?.name ?? undefined,
    workflowHtmlUrl: raw.workflow?.html_url,
    workflowBadgeUrl: raw.workflow?.badge_url,
    conclusion: raw.conclusion ?? undefined,
    headBranch: raw.head_branch ?? undefined,
    htmlUrl: raw.html_url,
    headSha: raw.head_sha,
    ...(raw.actor
      ? {
          actor: {
            login: raw.actor.login,
            id: raw.actor.id,
            avatarUrl: raw.actor.avatar_url,
            htmlUrl: raw.actor.html_url
          }
        }
      : {})
  }
}
