import { GitHubAccountId, GitHubRepoId, GitHubUserKey, GitHubWorkflowId } from '../../ioTypes/GitHubTypes.js'
import { PersistedVisibleAndNotifyConfigurable } from '../../ioTypes/UserSettingsSchemasAndTypes.js'

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

// ***

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
