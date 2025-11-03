import {
  GitHubPush,
  GitHubRepoSummary,
  GitHubWorkflowRunEvent,
  GitHubWorkflowSummary
} from '../../ioTypes/GitHubTypes.js'
import {
  fromRawGitHubAccountId,
  fromRawGitHubRepoId,
  fromRawGithubUserId,
  fromRawGithubWorkflowRunId
} from '../github/mappings/toFromRawGitHubIds.js'
import { narrowToWorkflowSummary } from '../github/githubWorkflow.js'
import { timestampToIso } from '../../util/dateAndTime.js'
import { logger } from '../../util/logging.js'
import { gitHubAccountTypeFromRaw } from '../github/mappings/FromRawGitHubMappings.js'
import {
  RawGithubAPIPushEventEvent,
  RawGithubAPIPushEventEventCommit,
  RawGithubWebhookPush,
  RawGithubWebhookPushCommit,
  RawGithubWorkflowRunEvent
} from '../../ioTypes/RawGitHubTypes.js'
import { RawGithubWebhookPushSchema } from '../../ioTypes/RawGitHubSchemas.js'

// TOEventually - consider dateTimes, e.g. for Pushes we get localized times
export function fromRawGithubWorkflowRunEvent(
  workflow: GitHubWorkflowSummary,
  raw: RawGithubWorkflowRunEvent
): GitHubWorkflowRunEvent {
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

// TODO - move or remove this
export function isRawGithubWebhookPush(x: unknown): x is RawGithubWebhookPush {
  const result = RawGithubWebhookPushSchema.safeParse(x)
  if (!result.success) {
    logger.error('Unexpected structure for RawGithubWebhookPush', { event: x, error: result.error })
  }
  return result.success
}

export function fromRawGithubWebhookPush(raw: unknown): GitHubPush | undefined {
  if (!isRawGithubWebhookPush(raw)) {
    return undefined
  }

  return {
    accountId: fromRawGitHubAccountId(raw.repository.owner.id),
    accountName: raw.repository.owner.name,
    accountType: gitHubAccountTypeFromRaw(raw.repository.owner.type),
    repoId: fromRawGitHubRepoId(raw.repository.id),
    repoName: raw.repository.name,
    repoUrl: raw.repository.html_url,
    actor: {
      userId: fromRawGithubUserId(raw.sender.id),
      userName: raw.sender.login,
      avatarUrl: raw.sender.avatar_url
    },
    // Use the datetime of the **LAST** commit for the date of this event
    dateTime: timestampToIso(raw.commits[raw.commits.length - 1].timestamp),
    ref: raw.ref,
    before: raw.before,
    commits: [
      // Explicitly include first element here to satisfy type
      fromRawGithubWebhookPushCommit(raw.commits[0]),
      ...raw.commits.slice(1).map(fromRawGithubWebhookPushCommit)
    ]
  }
}

function fromRawGithubWebhookPushCommit(commit: RawGithubWebhookPushCommit) {
  return {
    sha: commit.id,
    message: commit.message,
    distinct: commit.distinct,
    author: {
      name: commit.author.name,
      email: commit.author.email
    }
  }
}

export function fromRawGithubPushEventEvent(
  { accountId, accountName, repoName, repoId, accountType }: GitHubRepoSummary,
  raw: RawGithubAPIPushEventEvent
): GitHubPush | undefined {
  if (raw.payload.commits.length < 1) {
    logger.warn('RawGithubPushEventEvent with empty payload.commits array', { raw })
    return undefined
  }

  return {
    accountId,
    accountName,
    accountType,
    repoId,
    repoName,
    actor: {
      userId: fromRawGithubUserId(raw.actor.id),
      userName: raw.actor.login,
      avatarUrl: raw.actor.avatar_url
    },
    dateTime: raw.created_at,
    ref: raw.payload.ref,
    before: raw.payload.before,
    commits: [
      fromRawGithubPushEventEventCommit(raw.payload.commits[0]),
      ...raw.payload.commits.slice(1).map(fromRawGithubPushEventEventCommit)
    ]
  }
}

function fromRawGithubPushEventEventCommit(commit: RawGithubAPIPushEventEventCommit) {
  return {
    sha: commit.sha,
    message: commit.message,
    distinct: commit.distinct,
    author: {
      name: commit.author.name,
      email: commit.author.email
    }
  }
}
