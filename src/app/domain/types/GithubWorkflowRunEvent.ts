import { RawGithubWorkflowRunEvent } from './rawGithub/RawGithubWorkflowRunEvent'
import { fromRawGithubUserId } from './GithubUserId'
import {
  GithubUserSummary,
  GithubWorkflowSummary,
  isGithubUserSummary,
  isGithubWorkflowSummary
} from './GithubSummaries'
import { fromRawGithubWorkflowRunId, GithubWorkflowRunId, isGithubWorkflowRunId } from './GithubWorkflowRunId'
import { isString } from '../../util/types'
import { narrowToWorkflowSummary } from '../github/githubWorkflow'
import { GithubWorkflow } from './GithubWorkflow'

export interface GithubWorkflowRunEvent extends GithubWorkflowSummary {
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
  runEventCreatedAt: string
  runEventUpdatedAt: string
  runStartedAt?: string
  runHtmlUrl: string
  // TOEventually - what happens here for a manual push? Do we still get an actor?
  actor?: GithubWorkflowRunEventActor
}

export interface GithubWorkflowRunEventActor extends GithubUserSummary {
  avatarUrl: string
  htmlUrl: string
}

export interface FullGithubWorkflowRunEvent extends GithubWorkflowRunEvent, GithubWorkflow {}

export function isGithubWorkflowRunEvent(x: unknown): x is GithubWorkflowRunEvent {
  return (
    isGithubWorkflowSummary(x) &&
    'repoHtmlUrl' in x &&
    isString(x.repoHtmlUrl) &&
    'workflowRunId' in x &&
    isGithubWorkflowRunId(x.workflowRunId) &&
    'runNumber' in x &&
    'event' in x &&
    'headSha' in x &&
    'runEventCreatedAt' in x &&
    'runEventUpdatedAt' in x &&
    'runHtmlUrl' in x &&
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
export function fromRawGithubWorkflowRunEvent(
  workflow: GithubWorkflowSummary,
  raw: RawGithubWorkflowRunEvent
): GithubWorkflowRunEvent {
  return {
    ...narrowToWorkflowSummary(workflow),
    workflowRunId: fromRawGithubWorkflowRunId(raw.id),
    repoHtmlUrl: raw.repository.html_url,
    runNumber: raw.run_number,
    runAttempt: raw.run_attempt,
    event: raw.event,
    displayTitle: raw.display_title,
    runEventCreatedAt: raw.created_at,
    runEventUpdatedAt: raw.updated_at,
    runStartedAt: raw.run_started_at,
    status: raw.status ?? undefined,
    conclusion: raw.conclusion ?? undefined,
    headBranch: raw.head_branch ?? undefined,
    runHtmlUrl: raw.html_url,
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
