import { isNotNullObject } from '../../util/types.js'
import { GithubWorkflowId } from './GithubWorkflowId.js'
import { GithubUserKey, isGithubUserKey } from './GithubKeys.js'
import { GitHubAccountId, GitHubRepoId } from '../../types/GitHubIdTypes.js'

export type UserSetting = 'visible' | 'notify'

export function isUserSetting(x: unknown): x is UserSetting {
  return x === 'visible' || x === 'notify'
}

export interface PersistedUserSettings extends GithubUserKey {
  github: {
    accounts: Record<GitHubAccountId, PersistedGithubAccountSettings>
  }
}

export function isUserSettings(x: unknown): x is PersistedUserSettings {
  // TODO - this needs a lot more. Perhaps with AJV?
  return isGithubUserKey(x) && 'github' in x && isNotNullObject(x.github) && 'accounts' in x.github
}

export interface PersistedVisibleAndNotifyConfigurable {
  visible?: boolean
  notify?: boolean
}

export interface PersistedGithubAccountSettings extends PersistedVisibleAndNotifyConfigurable {
  repos: Record<GitHubRepoId, PersistedGithubRepoSettings>
}

export interface PersistedGithubRepoSettings extends PersistedVisibleAndNotifyConfigurable {
  workflows: Record<GithubWorkflowId, PersistedGithubWorkflowSettings>
}

export type PersistedGithubWorkflowSettings = PersistedVisibleAndNotifyConfigurable

// ***

export interface CalculatedUserSettings extends GithubUserKey {
  github: {
    accounts: Record<GitHubAccountId, CalculatedGithubAccountSettings>
  }
}

export type CalculatedVisibleAndNotifyConfigurable = Required<PersistedVisibleAndNotifyConfigurable>

export interface CalculatedGithubAccountSettings extends CalculatedVisibleAndNotifyConfigurable {
  repos: Record<GitHubRepoId, CalculatedGithubRepoSettings>
}

export interface CalculatedGithubRepoSettings extends CalculatedVisibleAndNotifyConfigurable {
  workflows: Record<GithubWorkflowId, CalculatedGithubWorkflowSettings>
}

export type CalculatedGithubWorkflowSettings = CalculatedVisibleAndNotifyConfigurable

// ***

export interface DisplayableUserSettings extends GithubUserKey {
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
  workflows: Record<GithubWorkflowId, DisplayableGithubWorkflowSettings>
}

export type DisplayableGithubWorkflowSettings = CalculatedGithubWorkflowSettings & Displayable
