import { GithubAccountKey, GithubRepoKey, GithubWorkflowKey } from './GithubKeys'
import { isNotNullObject } from '../../util/types'

export interface Toggle {
  state: boolean
}

export type GithubAccountToggle = GithubAccountKey & Toggle
export type GithubRepoToggle = GithubRepoKey | Toggle
export type GithubWorkflowToggle = GithubWorkflowKey | Toggle

// If an account isn't visible, then a workflow can't be visible
// but if an account doesn't have notifications, a workflow CAN still have notifications

export interface GithubUserSettings {
  accountVisibility?: GithubAccountToggle[]
  accountNotification?: GithubAccountToggle[]
  repoVisibility?: GithubRepoToggle[]
  repoNotification?: GithubRepoToggle[]
  workflowVisibility?: GithubWorkflowToggle[]
  workflowNotification?: GithubWorkflowToggle[]
}

export interface UserSettings {
  github: GithubUserSettings
}

export function isUserSettings(x: unknown): x is UserSettings {
  // TODO - eventually more here, perhaps with AJV
  return isNotNullObject(x) && 'github' in x && isNotNullObject(x.github)
}
