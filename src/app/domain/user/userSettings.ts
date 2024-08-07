import { AppState } from '../../environment/AppState'
import {
  GithubAccountSettings,
  GithubRepoSettings,
  GithubWorkflowSettings,
  UserSettings
} from '../types/UserSettings'
import { getWorkflowsForUser } from './userVisible'
import { GithubAccountId, GithubRepoId, GithubWorkflowId } from '../types/GithubKeys'
import { GithubWorkflow } from '../types/GithubWorkflow'

export async function getUserSettingsOrDefaultsForAllWorkflows(
  appState: AppState,
  userId: number,
  workflows?: GithubWorkflow[]
): Promise<UserSettings> {
  return userSettingsWithDefaults(
    await getUserSettings(),
    workflows ?? (await getWorkflowsForUser(appState, userId))
  )
}

export async function getUserSettings() {
  // TODO - get existing from DB, or initialize
  return {
    github: {
      accounts: new Map<GithubAccountId, GithubAccountSettings>()
    }
  }
}

export function userSettingsWithDefaults(userSettings: UserSettings, workflows: GithubWorkflow[]) {
  for (const { ownerId, repoId, workflowId } of workflows) {
    const accountSettings = getOrSetAndReturnAccountSettings(userSettings.github.accounts, ownerId)
    const repoSettings = getOrSetAndReturnRepoSettings(accountSettings.repos, repoId)

    const workflowSettings = repoSettings.workflows.get(workflowId)
    if (!workflowSettings) {
      repoSettings.workflows.set(workflowId, { visible: true, notify: true })
    }
  }

  return userSettings
}

function getOrSetAndReturnAccountSettings(
  accounts: Map<GithubAccountId, GithubAccountSettings>,
  accountId: GithubAccountId
) {
  const existingSettings = accounts.get(accountId)
  if (existingSettings) return existingSettings
  const newSettings = { visible: true, notify: true, repos: new Map<GithubRepoId, GithubRepoSettings>() }
  accounts.set(accountId, newSettings)
  return newSettings
}

function getOrSetAndReturnRepoSettings(repos: Map<GithubRepoId, GithubRepoSettings>, repoId: GithubRepoId) {
  const existingSettings = repos.get(repoId)
  if (existingSettings) return existingSettings
  const newSettings = {
    visible: true,
    notify: true,
    workflows: new Map<GithubWorkflowId, GithubWorkflowSettings>()
  }
  repos.set(repoId, newSettings)
  return newSettings
}
