import {
  GitHubAccountId,
  GitHubAccountType,
  GitHubInstallation,
  GitHubPublicAccount,
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

export function fromRawGithubUser(raw: RawGithubUser): GitHubUser {
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
