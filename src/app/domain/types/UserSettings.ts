import { GithubAccountId, GithubRepoId, GithubWorkflowId } from './GithubKeys'
import { isNotNullObject } from '../../util/types'

export function isUserSettings(x: unknown): x is UserSettings {
  // TODO - this needs a lot more. Perhaps with AJV?
  return isNotNullObject(x) && 'github' in x && isNotNullObject(x.github) && 'accounts' in x.github
}

export interface UserSettings {
  github: {
    accounts: Map<GithubAccountId, GithubAccountSettings>
  }
}

export interface VisibleAndNotifyConfigurable {
  visible?: boolean
  notify?: boolean
}

export interface GithubAccountSettings extends VisibleAndNotifyConfigurable {
  repos: Map<GithubRepoId, GithubRepoSettings>
}

export interface GithubRepoSettings extends VisibleAndNotifyConfigurable {
  workflows: Map<GithubWorkflowId, GithubWorkflowSettings>
}

export type GithubWorkflowSettings = VisibleAndNotifyConfigurable

export interface DisplayableUserSettings {
  github: {
    accounts: Map<GithubAccountId, DisplayableGithubAccountSettings>
  }
}

export interface Displayable {
  name: string
}

export interface DisplayableGithubAccountSettings
  extends Required<VisibleAndNotifyConfigurable>,
    Displayable {
  repos: Map<GithubRepoId, DisplayableGithubRepoSettings>
}

export interface DisplayableGithubRepoSettings extends Required<VisibleAndNotifyConfigurable>, Displayable {
  workflows: Map<GithubWorkflowId, DisplayableGithubWorkflowSettings>
}

export type DisplayableGithubWorkflowSettings = Required<VisibleAndNotifyConfigurable> & Displayable
