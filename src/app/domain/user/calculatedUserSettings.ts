import {
  CalculatedGithubAccountSettings,
  CalculatedGithubRepoSettings,
  CalculatedUserSettings,
  CalculatedVisibleAndNotifyConfigurable
} from '../types/UserSettings.js'
import { objectMap } from '../../util/collections.js'
import { AppState } from '../../environment/AppState.js'
import { getPersistedUserSettingsOrDefaults } from './persistedUserSettings.js'
import {
  GithubAccountStructure,
  GithubRepoStructure,
  UserScopeReferenceData
} from '../types/internalTypes.js'
import {
  PersistedGithubAccountSettings,
  PersistedGithubRepoSettings,
  PersistedUserSettings,
  PersistedVisibleAndNotifyConfigurable
} from '../../ioTypes/UserSettingsSchemasAndTypes.js'

const DEFAULT_ACCOUNT_NOTIFY = true

export async function loadCalculatedUserSettingsOrUseDefaults(
  appState: AppState,
  refData: UserScopeReferenceData
) {
  return calculateUserSettings(await getPersistedUserSettingsOrDefaults(appState, refData.userId), refData)
}

export function calculateUserSettings(
  settings: PersistedUserSettings,
  refData: UserScopeReferenceData
): CalculatedUserSettings {
  return {
    userId: settings.userId,
    github: {
      accounts: Object.fromEntries(
        [refData.memberAccount, ...Object.values(refData.publicAccounts)].map((account) => [
          account.accountId,
          calculateAccountSettings(settings.github.accounts[account.accountId], account)
        ])
      )
    }
  }
}

export function calculateAccountSettings(
  settings: PersistedGithubAccountSettings | undefined,
  account: GithubAccountStructure
): CalculatedGithubAccountSettings {
  const calculatedSettings = calculateSettings(settings, account.isMemberAccount, DEFAULT_ACCOUNT_NOTIFY)
  return {
    ...calculatedSettings,
    repos: calculatedSettings.visible
      ? objectMap(account.repos, (repoId, repo) => [
          repoId,
          calculateRepoSettings(settings?.repos[repo.repoId], repo, calculatedSettings.notify)
        ])
      : {}
  }
}

export function calculateRepoSettings(
  settings: PersistedGithubRepoSettings | undefined,
  repo: GithubRepoStructure,
  defaultNotify: boolean
): CalculatedGithubRepoSettings {
  const calculatedSettings = calculateSettings(settings, true, defaultNotify)
  return {
    ...calculatedSettings,
    workflows: calculatedSettings.visible
      ? objectMap(repo.workflows, (workflowId) => [
          workflowId,
          calculateWorkflowSettings(settings?.workflows[workflowId], true, calculatedSettings.notify)
        ])
      : {}
  }
}

const calculateWorkflowSettings = calculateSettings

export function calculateSettings(
  settings: PersistedVisibleAndNotifyConfigurable | undefined,
  defaultVisible: boolean,
  defaultNotify: boolean
): CalculatedVisibleAndNotifyConfigurable {
  const visible = settings?.visible ?? defaultVisible
  return {
    visible,
    notify: visible && (settings?.notify ?? defaultNotify)
  }
}
