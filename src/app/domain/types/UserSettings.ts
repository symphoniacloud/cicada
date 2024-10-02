import { isNotNullObject } from '../../util/types'
import { GithubAccountId } from './GithubAccountId'
import { GithubRepoId } from './GithubRepoId'
import { GithubWorkflowId } from './GithubWorkflowId'
import { GithubUserKey, isGithubUserKey } from './GithubKeys'

export type UserSetting = 'visible' | 'notify'

export function isUserSetting(x: unknown): x is UserSetting {
  return x === 'visible' || x === 'notify'
}

export interface PersistedUserSettings extends GithubUserKey {
  github: {
    accounts: Record<GithubAccountId, PersistedGithubAccountSettings>
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
  repos: Record<GithubRepoId, PersistedGithubRepoSettings>
}

export interface PersistedGithubRepoSettings extends PersistedVisibleAndNotifyConfigurable {
  workflows: Record<GithubWorkflowId, PersistedGithubWorkflowSettings>
}

export type PersistedGithubWorkflowSettings = PersistedVisibleAndNotifyConfigurable

// ***

export interface CalculatedUserSettings extends GithubUserKey {
  github: {
    accounts: Record<GithubAccountId, CalculatedGithubAccountSettings>
  }
}

export type CalculatedVisibleAndNotifyConfigurable = Required<PersistedVisibleAndNotifyConfigurable>

export interface CalculatedGithubAccountSettings extends CalculatedVisibleAndNotifyConfigurable {
  repos: Record<GithubRepoId, CalculatedGithubRepoSettings>
}

export interface CalculatedGithubRepoSettings extends CalculatedVisibleAndNotifyConfigurable {
  workflows: Record<GithubWorkflowId, CalculatedGithubWorkflowSettings>
}

export type CalculatedGithubWorkflowSettings = CalculatedVisibleAndNotifyConfigurable

// ***

export interface DisplayableUserSettings extends GithubUserKey {
  github: {
    accounts: Record<GithubAccountId, DisplayableGithubAccountSettings>
  }
}

export interface Displayable {
  name: string
}

export interface DisplayableGithubAccountSettings
  extends CalculatedVisibleAndNotifyConfigurable,
    Displayable {
  repos: Record<GithubRepoId, DisplayableGithubRepoSettings>
}

export interface DisplayableGithubRepoSettings extends CalculatedVisibleAndNotifyConfigurable, Displayable {
  workflows: Record<GithubWorkflowId, DisplayableGithubWorkflowSettings>
}

export type DisplayableGithubWorkflowSettings = CalculatedGithubWorkflowSettings & Displayable
