import { GithubAccountId, GithubRepoId, GithubUserId, GithubWorkflowId, isGithubUserId } from './GithubKeys'
import { isNotNullObject } from '../../util/types'

export type UserSetting = 'visible' | 'notify'

export function isUserSetting(x: unknown): x is UserSetting {
  return x === 'visible' || x === 'notify'
}

export function isUserSettings(x: unknown): x is PersistedUserSettings {
  // TODO - this needs a lot more. Perhaps with AJV?
  return (
    isNotNullObject(x) &&
    'userId' in x &&
    isGithubUserId(x.userId) &&
    'github' in x &&
    isNotNullObject(x.github) &&
    'accounts' in x.github
  )
}

export interface PersistedUserSettings {
  userId: GithubUserId
  github: {
    accounts: Map<GithubAccountId, PersistedGithubAccountSettings>
  }
}

export interface PersistedVisibleAndNotifyConfigurable {
  visible?: boolean
  notify?: boolean
}

export interface PersistedGithubAccountSettings extends PersistedVisibleAndNotifyConfigurable {
  repos: Map<GithubRepoId, PersistedGithubRepoSettings>
}

export interface PersistedGithubRepoSettings extends PersistedVisibleAndNotifyConfigurable {
  workflows: Map<GithubWorkflowId, PersistedGithubWorkflowSettings>
}

export type PersistedGithubWorkflowSettings = PersistedVisibleAndNotifyConfigurable

// ***

export interface CalculatedUserSettings {
  userId: GithubUserId
  github: {
    accounts: Map<GithubAccountId, CalculatedGithubAccountSettings>
  }
}

export type CalculatedVisibleAndNotifyConfigurable = Required<PersistedVisibleAndNotifyConfigurable>

export interface CalculatedGithubAccountSettings extends CalculatedVisibleAndNotifyConfigurable {
  repos: Map<GithubRepoId, CalculatedGithubRepoSettings>
}

export interface CalculatedGithubRepoSettings extends CalculatedVisibleAndNotifyConfigurable {
  workflows: Map<GithubWorkflowId, CalculatedGithubWorkflowSettings>
}

export type CalculatedGithubWorkflowSettings = CalculatedVisibleAndNotifyConfigurable

// ***

export interface DisplayableUserSettings {
  github: {
    accounts: Map<GithubAccountId, DisplayableGithubAccountSettings>
  }
}

export interface Displayable {
  name: string
}

export interface DisplayableGithubAccountSettings
  extends CalculatedVisibleAndNotifyConfigurable,
    Displayable {
  repos: Map<GithubRepoId, DisplayableGithubRepoSettings>
}

export interface DisplayableGithubRepoSettings extends CalculatedVisibleAndNotifyConfigurable, Displayable {
  workflows: Map<GithubWorkflowId, DisplayableGithubWorkflowSettings>
}

export type DisplayableGithubWorkflowSettings = CalculatedGithubWorkflowSettings & Displayable
