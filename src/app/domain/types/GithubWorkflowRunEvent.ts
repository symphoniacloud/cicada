import { RawGithubWorkflowRunEvent } from './rawGithub/RawGithubWorkflowRunEvent.js'
import { isString } from '../../util/types.js'
import { narrowToWorkflowSummary } from '../github/githubWorkflow.js'
import { fromRawGithubUserId, fromRawGithubWorkflowRunId } from './toFromRawGitHubIds.js'
import {
  isGitHubUserSummary,
  isGitHubWorkflowRunId,
  isGitHubWorkflowSummary
} from '../../types/GitHubTypeChecks.js'
import {
  GitHubUserSummary,
  GitHubWorkflow,
  GitHubWorkflowRunId,
  GitHubWorkflowSummary
} from '../../types/GitHubTypes.js'

export interface GithubWorkflowRunEvent extends GitHubWorkflowSummary {
  repoHtmlUrl: string
  workflowRunId: GitHubWorkflowRunId
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

export interface GithubWorkflowRunEventActor extends GitHubUserSummary {
  avatarUrl: string
  htmlUrl: string
}

export interface FullGithubWorkflowRunEvent extends GithubWorkflowRunEvent, GitHubWorkflow {}

export function isGithubWorkflowRunEvent(x: unknown): x is GithubWorkflowRunEvent {
  return (
    isGitHubWorkflowSummary(x) &&
    'repoHtmlUrl' in x &&
    isString(x.repoHtmlUrl) &&
    'workflowRunId' in x &&
    isGitHubWorkflowRunId(x.workflowRunId) &&
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
    isGitHubUserSummary(x) &&
    'avatarUrl' in x &&
    isString(x.avatarUrl) &&
    'htmlUrl' in x &&
    isString(x.htmlUrl)
  )
}

// TOEventually - consider dateTimes, e.g. for Pushes we get localized times
export function fromRawGithubWorkflowRunEvent(
  workflow: GitHubWorkflowSummary,
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
