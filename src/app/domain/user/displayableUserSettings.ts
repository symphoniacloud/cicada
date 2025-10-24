import {
  CalculatedGithubAccountSettings,
  CalculatedGithubRepoSettings,
  CalculatedGithubWorkflowSettings,
  CalculatedUserSettings,
  DisplayableGithubAccountSettings,
  DisplayableGithubRepoSettings,
  DisplayableGithubWorkflowSettings,
  DisplayableUserSettings
} from '../types/UserSettings.js'
import { calculateUserSettings } from './calculatedUserSettings.js'
import { AppState } from '../../environment/AppState.js'
import { getPersistedUserSettingsOrDefaults } from './persistedUserSettings.js'
import {
  getAccountStructure,
  getRepoStructureFromAccount,
  getWorkflowFromRepo
} from '../github/userScopeReferenceData.js'
import { logger } from '../../util/logging.js'
import {
  GitHubAccountId,
  GitHubRepoId,
  GitHubWorkflowId,
  GitHubWorkflowSummary
} from '../../ioTypes/GitHubTypes.js'
import {
  GithubAccountStructure,
  GithubRepoStructure,
  UserScopeReferenceData
} from '../types/internalTypes.js'
import { PersistedUserSettings } from '../../ioTypes/UserSettingsSchemasAndTypes.js'

export async function loadCalculatedAndDisplayableUserSettingsOrUseDefaults(
  appState: AppState,
  refData: UserScopeReferenceData
) {
  return toCalculatedAndDisplayableUserSettings(
    await getPersistedUserSettingsOrDefaults(appState, refData.userId),
    refData
  )
}

export function toCalculatedAndDisplayableUserSettings(
  userSettings: PersistedUserSettings,
  refData: UserScopeReferenceData
): DisplayableUserSettings {
  return toDisplayableUserSettings(calculateUserSettings(userSettings, refData), refData)
}

function toDisplayableUserSettings(
  userSettings: CalculatedUserSettings,
  refData: UserScopeReferenceData
): DisplayableUserSettings {
  const accountsSettings: Record<GitHubAccountId, DisplayableGithubAccountSettings> = {}
  for (const [accountId, accountSettings] of Object.entries(userSettings.github.accounts)) {
    const account = getAccountStructure(refData, accountId as GitHubAccountId)
    if (account) {
      accountsSettings[accountId as GitHubAccountId] = toDisplayableAccountSettings(accountSettings, account)
    }
  }

  return {
    userId: userSettings.userId,
    github: {
      accounts: accountsSettings
    }
  }
}

export function toDisplayableAccountSettings(
  accountSettings: CalculatedGithubAccountSettings,
  account: GithubAccountStructure
): DisplayableGithubAccountSettings {
  const reposSettings: Record<GitHubRepoId, DisplayableGithubRepoSettings> = {}
  for (const [repoId, repoSettings] of Object.entries(accountSettings.repos)) {
    const repo = getRepoStructureFromAccount(account, {
      accountId: account.accountId,
      repoId: repoId as GitHubRepoId
    })
    if (repo) {
      reposSettings[repoId as GitHubRepoId] = toDisplayableRepoSettings(repoSettings, repo)
    }
  }
  return {
    ...accountSettings,
    name: account.accountName,
    repos: reposSettings
  }
}

export function toDisplayableRepoSettings(
  repoSettings: CalculatedGithubRepoSettings,
  repo: GithubRepoStructure
): DisplayableGithubRepoSettings {
  logger.debug('toDisplayableRepoSettings', { repo, repoSettings })
  const workflowsSettings: Record<GitHubWorkflowId, DisplayableGithubWorkflowSettings> = {}
  for (const [workflowId, workflowSettings] of Object.entries(repoSettings.workflows)) {
    const workflow = getWorkflowFromRepo(repo, {
      ...repo,
      workflowId: workflowId as GitHubWorkflowId
    })
    if (workflow) {
      workflowsSettings[workflowId as GitHubWorkflowId] = toDisplayableWorkflowSettings(
        workflowSettings,
        workflow
      )
    }
  }

  return {
    ...repoSettings,
    name: repo.repoName,
    workflows: workflowsSettings
  }
}

export function toDisplayableWorkflowSettings(
  workflowSettings: CalculatedGithubWorkflowSettings,
  workflow: GitHubWorkflowSummary
) {
  return {
    name: workflow.workflowName,
    ...workflowSettings
  }
}
