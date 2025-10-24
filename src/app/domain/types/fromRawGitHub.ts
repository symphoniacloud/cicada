import {
  GitHubAccountId,
  GitHubAccountType,
  GitHubInstallation,
  GitHubPublicAccount,
  GitHubRepo,
  GitHubRepoSummary,
  GitHubUser,
  GitHubWorkflow
} from '../../types/GitHubTypes.js'
import { isGithubAccountType } from '../../types/GitHubTypeChecks.js'
import { RawGithubInstallation } from './rawGithub/RawGithubInstallation.js'
import {
  fromRawGitHubAccountId,
  fromRawGithubAppId,
  fromRawGithubInstallationId,
  fromRawGitHubRepoId,
  fromRawGithubUserId,
  fromRawGitHubWorkflowId
} from './toFromRawGitHubIds.js'
import { RawGithubUser } from './rawGithub/RawGithubUser.js'
import { RawGithubRepo } from './rawGithub/RawGithubRepo.js'
import { RawGithubWorkflow } from './rawGithub/RawGithubWorkflow.js'

// TODO - can use zod parsing for this

export function fromRawAccountType(accountType: unknown): GitHubAccountType {
  if (typeof accountType !== 'string') {
    throw new Error('accountType type was not string')
  }

  const lower = accountType.toLowerCase()
  if (!isGithubAccountType(lower)) {
    throw new Error(`${accountType} is an unknown account type`)
  }

  return lower
}

export function fromRawGithubInstallation(raw: RawGithubInstallation): GitHubInstallation {
  return {
    installationId: fromRawGithubInstallationId(raw.id),
    appId: fromRawGithubAppId(raw.app_id),
    appSlug: raw.app_slug,
    accountName: raw.account.login,
    accountId: fromRawGitHubAccountId(raw.account.id),
    accountType: fromRawAccountType(raw.target_type)
  }
}

export function publicAccountFromRawGithubUser(
  user: RawGithubUser,
  installationAccountId: GitHubAccountId
): GitHubPublicAccount {
  return {
    accountId: fromRawGitHubAccountId(user.id),
    accountType: fromRawAccountType(user.type),
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
    accountId: fromRawGitHubAccountId(raw.owner.id),
    accountName: raw.owner.login,
    accountType: fromRawAccountType(raw.owner.type),
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
