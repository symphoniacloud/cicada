import { isNotNullObject } from '../../util/types'
import { GithubAccountId } from './GithubAccountId'
import { GithubUserId, isGithubUserId } from './GithubUserId'
import { GithubRepoId } from './GithubRepoId'
import { GithubWorkflowId } from './GithubWorkflowId'

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

// Various types here use a string for Record key, rather than GithubAccountID, etc.
// That's because JavaScript always uses strings for object keys, even if the Record type says number
// An earlier version of this code used Maps to keep the strong typing of the ID keys
// but it made the code more verbose - especially for tests - so I decided just to suck it up
// and go with string ID keys

export interface PersistedUserSettings {
  userId: GithubUserId
  github: {
    accounts: Record<string, PersistedGithubAccountSettings>
  }
}

export interface PersistedVisibleAndNotifyConfigurable {
  visible?: boolean
  notify?: boolean
}

export interface PersistedGithubAccountSettings extends PersistedVisibleAndNotifyConfigurable {
  repos: Record<string, PersistedGithubRepoSettings>
}

export interface PersistedGithubRepoSettings extends PersistedVisibleAndNotifyConfigurable {
  workflows: Record<string, PersistedGithubWorkflowSettings>
}

export type PersistedGithubWorkflowSettings = PersistedVisibleAndNotifyConfigurable

// ***

export interface CalculatedUserSettings {
  userId: GithubUserId
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

export interface DisplayableUserSettings {
  userId: GithubUserId
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
