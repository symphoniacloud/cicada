import {
  CalculatedGithubAccountSettings,
  CalculatedGithubRepoSettings,
  CalculatedUserSettings,
  CalculatedVisibleAndNotifyConfigurable,
  PersistedGithubAccountSettings,
  PersistedGithubRepoSettings,
  PersistedUserSettings,
  PersistedVisibleAndNotifyConfigurable
} from '../types/UserSettings'
import {
  GithubAccountStructure,
  GithubInstallationAccountStructure,
  GithubRepoStructure
} from '../types/GithubAccountStructure'
import { objectMap } from '../../util/collections'

const DEFAULT_ACCOUNT_NOTIFY = true

export function calculateUserSettings(
  settings: PersistedUserSettings,
  installationAccount: GithubInstallationAccountStructure
): CalculatedUserSettings {
  return {
    userId: settings.userId,
    github: {
      accounts: Object.fromEntries(
        [installationAccount, ...Object.values(installationAccount.publicAccounts)].map((account) => [
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
  const calculatedSettings = calculateSettings(settings, DEFAULT_ACCOUNT_NOTIFY)
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
  const calculatedSettings = calculateSettings(settings, defaultNotify)
  return {
    ...calculatedSettings,
    workflows: calculatedSettings.visible
      ? objectMap(repo.workflows, (workflowId) => [
          workflowId,
          calculateWorkflowSettings(settings?.workflows[workflowId], calculatedSettings.notify)
        ])
      : {}
  }
}

const calculateWorkflowSettings = calculateSettings

export function calculateSettings(
  settings: PersistedVisibleAndNotifyConfigurable | undefined,
  defaultNotify: boolean
): CalculatedVisibleAndNotifyConfigurable {
  const visible = settings?.visible ?? true
  return {
    visible,
    notify: visible && (settings?.notify ?? defaultNotify)
  }
}
