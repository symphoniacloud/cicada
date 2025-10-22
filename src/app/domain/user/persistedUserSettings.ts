import { AppState } from '../../environment/AppState.js'
import {
  PersistedGithubAccountSettings,
  PersistedGithubRepoSettings,
  PersistedGithubWorkflowSettings,
  PersistedUserSettings,
  UserSetting
} from '../types/UserSettings.js'
import { GithubRepoKey, GithubWorkflowKey } from '../types/GithubKeys.js'
import { getUserSettings, saveUserSettings } from '../entityStore/entities/UserSettingsEntity.js'
import { getOrSetNewAndReturn } from '../../util/collections.js'
import { GithubAccountId } from '../types/GithubAccountId.js'
import { GithubUserId } from '../types/GithubUserId.js'

export async function getPersistedUserSettingsOrDefaults(
  appState: AppState,
  userId: GithubUserId
): Promise<PersistedUserSettings> {
  return (await getUserSettings(appState.entityStore, userId)) ?? initialUserSettings(userId)
}

export async function resetPersistedUserSettings(
  appState: AppState,
  userId: GithubUserId
): Promise<PersistedUserSettings> {
  return await saveUserSettings(appState.entityStore, initialUserSettings(userId))
}

function initialUserSettings(userId: GithubUserId): PersistedUserSettings {
  return {
    userId,
    github: {
      accounts: {}
    }
  }
}

export async function updateAndSaveAccountSetting(
  appState: AppState,
  userId: GithubUserId,
  accountId: GithubAccountId,
  setting: UserSetting,
  value: boolean
) {
  return updateAndSaveSettings(appState, userId, accountUpdater(accountId, setting, value))
}

export function accountUpdater(accountId: GithubAccountId, setting: UserSetting, value: boolean) {
  return (settings: PersistedUserSettings) => {
    const accountSettings = getOrCreateAndReturnAccountSettings(settings, accountId)
    accountSettings[setting] = value
    return settings
  }
}

export async function updateAndSaveRepoSetting(
  appState: AppState,
  userId: GithubUserId,
  repoKey: GithubRepoKey,
  setting: UserSetting,
  value: boolean
) {
  return updateAndSaveSettings(appState, userId, repoUpdater(repoKey, setting, value))
}

export function repoUpdater(repoKey: GithubRepoKey, setting: UserSetting, value: boolean) {
  return (settings: PersistedUserSettings) => {
    const repoSettings = getOrCreateAndReturnRepoSettings(settings, repoKey)
    repoSettings[setting] = value
    return settings
  }
}

export async function updateAndSaveWorkflowSetting(
  appState: AppState,
  userId: GithubUserId,
  workflowKey: GithubWorkflowKey,
  setting: UserSetting,
  value: boolean
) {
  return updateAndSaveSettings(appState, userId, workflowUpdater(workflowKey, setting, value))
}

export function workflowUpdater(workflowKey: GithubWorkflowKey, setting: UserSetting, value: boolean) {
  return (settings: PersistedUserSettings) => {
    const workflowSettings = getOrCreateAndReturnWorkflowSettings(settings, workflowKey)
    workflowSettings[setting] = value
    return settings
  }
}

export async function updateAndSaveSettings(
  appState: AppState,
  userId: GithubUserId,
  updateSettings: (settings: PersistedUserSettings) => PersistedUserSettings
) {
  return await saveUserSettings(
    appState.entityStore,
    updateSettings(await getPersistedUserSettingsOrDefaults(appState, userId))
  )
}

function getOrCreateAndReturnAccountSettings(
  settings: PersistedUserSettings,
  accountId: GithubAccountId
): PersistedGithubAccountSettings {
  return getOrSetNewAndReturn(settings.github.accounts, `${accountId}`, () => ({
    repos: {}
  }))
}

function getOrCreateAndReturnRepoSettings(
  settings: PersistedUserSettings,
  repoKey: GithubRepoKey
): PersistedGithubRepoSettings {
  const accountSettings = getOrCreateAndReturnAccountSettings(settings, repoKey.accountId)
  return getOrSetNewAndReturn(accountSettings.repos, `${repoKey.repoId}`, () => ({
    workflows: {}
  }))
}

function getOrCreateAndReturnWorkflowSettings(
  settings: PersistedUserSettings,
  workflowKey: GithubWorkflowKey
): PersistedGithubWorkflowSettings {
  const repoSettings = getOrCreateAndReturnRepoSettings(settings, workflowKey)
  return getOrSetNewAndReturn(repoSettings.workflows, `${workflowKey.workflowId}`, () => ({}))
}
