import {
  GitHubAccountId,
  GitHubAccountSummary,
  GitHubRepoId,
  GitHubRepoSummary,
  GitHubUserId,
  GitHubUserKey,
  GitHubWorkflow,
  GitHubWorkflowId,
  GitHubWorkflowRunEvent
} from '../../ioTypes/GitHubTypes.js'
import { PersistedVisibleAndNotifyConfigurable } from '../../ioTypes/UserSettingsSchemasAndTypes.js'

export type FullGitHubWorkflowRunEvent = GitHubWorkflowRunEvent & GitHubWorkflow

export interface GithubAccountStructure extends GitHubAccountSummary {
  isMemberAccount: boolean
  repos: Record<GitHubRepoId, GithubRepoStructure>
}

export interface GithubRepoStructure extends GitHubRepoSummary {
  workflows: Record<GitHubWorkflowId, GitHubWorkflow>
}

export interface UserScopeReferenceData {
  userId: GitHubUserId
  // This will become a map when user can be a member of multiple Cicada accounts
  memberAccount: GithubAccountStructure
  publicAccounts: Record<GitHubAccountId, GithubAccountStructure>
}
export interface CalculatedUserSettings extends GitHubUserKey {
  github: {
    accounts: Record<GitHubAccountId, CalculatedGithubAccountSettings>
  }
}

export type CalculatedVisibleAndNotifyConfigurable = Required<PersistedVisibleAndNotifyConfigurable>

export interface CalculatedGithubAccountSettings extends CalculatedVisibleAndNotifyConfigurable {
  repos: Record<GitHubRepoId, CalculatedGithubRepoSettings>
}

export interface CalculatedGithubRepoSettings extends CalculatedVisibleAndNotifyConfigurable {
  workflows: Record<GitHubWorkflowId, CalculatedGithubWorkflowSettings>
}

export type CalculatedGithubWorkflowSettings = CalculatedVisibleAndNotifyConfigurable

export interface DisplayableUserSettings extends GitHubUserKey {
  github: {
    accounts: Record<GitHubAccountId, DisplayableGithubAccountSettings>
  }
}

export interface Displayable {
  name: string
}

export interface DisplayableGithubAccountSettings
  extends CalculatedVisibleAndNotifyConfigurable,
    Displayable {
  repos: Record<GitHubRepoId, DisplayableGithubRepoSettings>
}

export interface DisplayableGithubRepoSettings extends CalculatedVisibleAndNotifyConfigurable, Displayable {
  workflows: Record<GitHubWorkflowId, DisplayableGithubWorkflowSettings>
}

export type DisplayableGithubWorkflowSettings = CalculatedGithubWorkflowSettings & Displayable
