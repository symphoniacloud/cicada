import { isNotNullObject } from '../../util/types.js'
import { GitHubAccountId, GitHubRepoId, GitHubUserKey, GitHubWorkflowId } from '../../ioTypes/GitHubTypes.js'
import { isGitHubUserKey } from '../../ioTypes/GitHubTypeChecks.js'

export type UserSetting = 'visible' | 'notify'

export interface PersistedUserSettings extends GitHubUserKey {
  github: {
    accounts: Record<GitHubAccountId, PersistedGithubAccountSettings>
  }
}

export function isUserSettings(x: unknown): x is PersistedUserSettings {
  // TODO - this needs a lot more. Perhaps with AJV?
  return isGitHubUserKey(x) && 'github' in x && isNotNullObject(x.github) && 'accounts' in x.github
}

export interface PersistedVisibleAndNotifyConfigurable {
  visible?: boolean
  notify?: boolean
}

export interface PersistedGithubAccountSettings extends PersistedVisibleAndNotifyConfigurable {
  repos: Record<GitHubRepoId, PersistedGithubRepoSettings>
}

export interface PersistedGithubRepoSettings extends PersistedVisibleAndNotifyConfigurable {
  workflows: Record<GitHubWorkflowId, PersistedGithubWorkflowSettings>
}

export type PersistedGithubWorkflowSettings = PersistedVisibleAndNotifyConfigurable

// ***

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
