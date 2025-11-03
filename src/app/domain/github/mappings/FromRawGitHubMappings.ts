import {
  GitHubAccountId,
  GitHubAccountType,
  GitHubInstallation,
  GitHubPublicAccount,
  GitHubPush,
  GitHubRepo,
  GitHubRepoSummary,
  GitHubUser,
  GitHubWorkflow
} from '../../../ioTypes/GitHubTypes.js'
import { GitHubAccountTypeSchema } from '../../../ioTypes/GitHubSchemas.js'
import {
  RawGithubInstallation,
  RawGithubRepo,
  RawGitHubTargetType,
  RawGithubUser,
  RawGithubWebhookPush,
  RawGithubWebhookPushCommit,
  RawGithubWorkflow
} from '../../../ioTypes/RawGitHubTypes.js'
import {
  fromRawGitHubAccountId,
  fromRawGithubAppId,
  fromRawGithubInstallationId,
  fromRawGitHubRepoId,
  fromRawGithubUserId,
  fromRawGitHubWorkflowId
} from './toFromRawGitHubIds.js'
import { timestampToIso } from '../../../util/dateAndTime.js'

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

export function fromRawGithubWebhookPush(raw: RawGithubWebhookPush): GitHubPush {
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
