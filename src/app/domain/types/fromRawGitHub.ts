import {
  GitHubAccountId,
  GitHubPublicAccount,
  GitHubPush,
  GitHubRepo,
  GitHubRepoSummary,
  GitHubUser,
  GitHubWorkflow,
  GitHubWorkflowRunEvent,
  GitHubWorkflowSummary
} from '../../ioTypes/GitHubTypes.js'
import {
  fromRawGitHubRepoId,
  fromRawGithubUserId,
  fromRawGitHubWorkflowId,
  fromRawGithubWorkflowRunId
} from './toFromRawGitHubIds.js'
import { RawGithubWorkflowRunEvent } from './rawGithub/RawGithubWorkflowRunEvent.js'
import { narrowToWorkflowSummary } from '../github/githubWorkflow.js'
import {
  RawGithubAPIPushEventEvent,
  RawGithubAPIPushEventEventCommit
} from './rawGithub/RawGithubAPIPushEventEvent.js'
import { isRawGithubWebhookPush, RawGithubWebhookPushCommit } from './rawGithub/RawGithubWebhookPush.js'
import { timestampToIso } from '../../util/dateAndTime.js'
import { logger } from '../../util/logging.js'
import { RawGithubRepo, RawGithubUser, RawGithubWorkflow } from '../../ioTypes/RawGitHubTypes.js'
import {
  GitHubAccountIdFromUnparsedRaw,
  GithubAccountTypeFromUnparsedRaw
} from '../github/mappings/FromRawGitHubMappings.js'

export function publicAccountFromRawGithubUser(
  user: RawGithubUser,
  installationAccountId: GitHubAccountId
): GitHubPublicAccount {
  return {
    accountId: GitHubAccountIdFromUnparsedRaw.parse(user.id),
    accountType: GithubAccountTypeFromUnparsedRaw.parse(user.type),
    accountName: user.login,
    installationAccountId
  }
}

export function fromRawGithubUser(raw: RawGithubUser): GitHubUser {
  return {
    userId: fromRawGithubUserId(raw.id),
    userName: raw.login,
    url: raw.url,
    avatarUrl: raw.avatar_url,
    htmlUrl: raw.html_url
  }
}

export function fromRawGithubRepo(raw: RawGithubRepo): GitHubRepo {
  return {
    accountId: GitHubAccountIdFromUnparsedRaw.parse(raw.owner.id),
    accountName: raw.owner.login,
    accountType: GithubAccountTypeFromUnparsedRaw.parse(raw.owner.type),
    repoId: fromRawGitHubRepoId(raw.id),
    repoName: raw.name,
    fullName: raw.full_name,
    private: raw.private,
    htmlUrl: raw.html_url,
    description: raw.description ?? '',
    fork: raw.fork,
    url: raw.url,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    pushedAt: raw.pushed_at,
    homepage: raw.homepage ?? '',
    archived: raw.archived,
    disabled: raw.disabled,
    visibility: raw.visibility,
    defaultBranch: raw.default_branch
  }
}

// We store more on a Workflow than we get from the Github API, so workflows can only
// be stored in the context of a repo
export function fromRawGithubWorkflow(repo: GitHubRepoSummary, raw: RawGithubWorkflow): GitHubWorkflow {
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
export function fromRawGithubWebhookPush(raw: unknown): GitHubPush | undefined {
  if (!isRawGithubWebhookPush(raw)) {
    return undefined
  }

  return {
    accountId: GitHubAccountIdFromUnparsedRaw.parse(raw.repository.owner.id),
    accountName: raw.repository.owner.name,
    accountType: GithubAccountTypeFromUnparsedRaw.parse(raw.repository.owner.type),
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
