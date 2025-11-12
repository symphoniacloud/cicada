import {
  GitHubAccountId,
  GitHubAccountType,
  GitHubInstallation,
  GitHubPublicAccount,
  GitHubPush,
  GitHubRepo,
  GitHubRepoSummary,
  GitHubUser,
  GitHubWorkflow,
  GitHubWorkflowRunEvent,
  GitHubWorkflowSummary
} from '../../../ioTypes/GitHubTypes.js'
import { GitHubAccountTypeSchema } from '../../../ioTypes/GitHubSchemas.js'
import {
  RawGithubInstallation,
  RawGithubPushFromApi,
  RawGithubPushFromWebhook,
  RawGithubPushFromWebhookCommit,
  RawGithubRepo,
  RawGitHubTargetType,
  RawGithubUser,
  RawGithubWorkflow,
  RawGithubWorkflowRunEvent
} from '../../../ioTypes/RawGitHubTypes.js'
import {
  fromRawGitHubAccountId,
  fromRawGithubAppId,
  fromRawGithubInstallationId,
  fromRawGitHubRepoId,
  fromRawGithubUserId,
  fromRawGitHubWorkflowId,
  fromRawGithubWorkflowRunId
} from './toFromRawGitHubIds.js'
import { timestampToIso } from '../../../util/dateAndTime.js'
import { narrowToWorkflowSummary } from '../githubWorkflow.js'

export function gitHubAccountTypeFromRaw(raw: RawGitHubTargetType): GitHubAccountType {
  return GitHubAccountTypeSchema.parse(raw.toLowerCase())
}

export function gitHubInstallationFromRaw(raw: RawGithubInstallation): GitHubInstallation {
  return {
    installationId: fromRawGithubInstallationId(raw.id),
    appId: fromRawGithubAppId(raw.app_id),
    appSlug: raw.app_slug,
    accountName: raw.account.login,
    accountId: fromRawGitHubAccountId(raw.account.id),
    accountType: gitHubAccountTypeFromRaw(raw.target_type)
  }
}

export function gitHubUserFromRaw(raw: RawGithubUser): GitHubUser {
  return {
    userId: fromRawGithubUserId(raw.id),
    userName: raw.login,
    url: raw.url,
    avatarUrl: raw.avatar_url,
    htmlUrl: raw.html_url
  }
}

export function publicAccountFromRawGithubUser(
  user: RawGithubUser,
  installationAccountId: GitHubAccountId
): GitHubPublicAccount {
  return {
    accountId: fromRawGitHubAccountId(user.id),
    accountType: gitHubAccountTypeFromRaw(user.type),
    accountName: user.login,
    installationAccountId
  }
}

export function fromRawGithubRepo(raw: RawGithubRepo): GitHubRepo {
  return {
    accountId: fromRawGitHubAccountId(raw.owner.id),
    accountName: raw.owner.login,
    accountType: gitHubAccountTypeFromRaw(raw.owner.type),
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

export function fromRawGithubPushFromWebhook(raw: RawGithubPushFromWebhook): GitHubPush {
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
    // TOEventually - check if we always get a head_commit, even if nothing in commits
    dateTime: timestampToIso(raw.head_commit.timestamp),
    ref: raw.ref,
    before: raw.before,
    headSha: raw.head_commit.id,
    commits: raw.commits ? raw.commits.map(fromRawGithubPushFromWebhookCommit) : undefined
  }
}

function fromRawGithubPushFromWebhookCommit(commit: RawGithubPushFromWebhookCommit) {
  return {
    sha: commit.id,
    ...fromRawGithubPushCommitCommon(commit)
  }
}

function fromRawGithubPushCommitCommon(commit: RawGithubPushFromWebhookCommit) {
  return {
    message: commit.message,
    distinct: commit.distinct,
    author: {
      name: commit.author.name,
      email: commit.author.email
    }
  }
}

export function fromRawGithubPushFromApi(
  { accountId, accountName, repoName, repoId, accountType }: GitHubRepoSummary,
  raw: RawGithubPushFromApi
): GitHubPush {
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
    headSha: raw.payload.head,
    // commits aren't available from Github PushEvent API
    commits: []
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
