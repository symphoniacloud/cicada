import { AppState } from '../../environment/AppState'
import {
  PersistedGithubAccountSettings,
  PersistedGithubRepoSettings,
  PersistedGithubWorkflowSettings,
  PersistedUserSettings,
  UserSetting
} from '../types/UserSettings'
import {
  GithubAccountId,
  GithubRepoId,
  GithubRepoKey,
  GithubUserId,
  GithubWorkflowId,
  GithubWorkflowKey
} from '../types/GithubKeys'
import { UserSettingsEntity } from '../entityStore/entities/UserSettingsEntity'
import { getFromMapOrSetNewAndReturn } from '../../util/collections'

export async function saveUserSettings(
  appState: AppState,
  userSettings: PersistedUserSettings
): Promise<PersistedUserSettings> {
  return await appState.entityStore.for(UserSettingsEntity).put(userSettings)
}

export async function getUserSettings(
  appState: AppState,
  userId: GithubUserId
): Promise<PersistedUserSettings> {
  return (
    (await appState.entityStore.for(UserSettingsEntity).getOrUndefined({ userId })) ?? {
      userId,
      github: {
        accounts: new Map<GithubAccountId, PersistedGithubAccountSettings>()
      }
    }
  )
}

export async function updateAndSaveAccountSetting(
  appState: AppState,
  userId: GithubUserId,
  ownerId: GithubAccountId,
  setting: UserSetting,
  value: boolean
) {
  return updateAndSaveSettings(appState, userId, accountUpdater(ownerId, setting, value))
}

export function accountUpdater(ownerId: GithubAccountId, setting: UserSetting, value: boolean) {
  return (settings: PersistedUserSettings) => {
    const accountSettings = getOrCreateAndReturnAccountSettings(settings, ownerId)
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
  return await saveUserSettings(appState, updateSettings(await getUserSettings(appState, userId)))
}

function getOrCreateAndReturnAccountSettings(
  settings: PersistedUserSettings,
  accountId: GithubAccountId
): PersistedGithubAccountSettings {
  return getFromMapOrSetNewAndReturn(settings.github.accounts, accountId, () => ({
    repos: new Map<GithubRepoId, PersistedGithubRepoSettings>()
  }))
}

function getOrCreateAndReturnRepoSettings(
  settings: PersistedUserSettings,
  repoKey: GithubRepoKey
): PersistedGithubRepoSettings {
  const accountSettings = getOrCreateAndReturnAccountSettings(settings, repoKey.ownerId)
  return getFromMapOrSetNewAndReturn(accountSettings.repos, repoKey.repoId, () => ({
    workflows: new Map<GithubWorkflowId, PersistedGithubWorkflowSettings>()
  }))
}

function getOrCreateAndReturnWorkflowSettings(
  settings: PersistedUserSettings,
  workflowKey: GithubWorkflowKey
): PersistedGithubWorkflowSettings {
  const repoSettings = getOrCreateAndReturnRepoSettings(settings, workflowKey)
  return getFromMapOrSetNewAndReturn(repoSettings.workflows, workflowKey.workflowId, () => ({}))
}
