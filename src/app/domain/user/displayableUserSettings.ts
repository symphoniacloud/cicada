import {
  CalculatedGithubAccountSettings,
  CalculatedGithubRepoSettings,
  CalculatedGithubWorkflowSettings,
  CalculatedUserSettings,
  DisplayableGithubAccountSettings,
  DisplayableGithubRepoSettings,
  DisplayableGithubWorkflowSettings,
  DisplayableUserSettings,
  PersistedUserSettings
} from '../types/UserSettings.js'
import { calculateUserSettings } from './calculatedUserSettings.js'
import {
  GithubAccountStructure,
  GithubRepoStructure,
  UserScopeReferenceData
} from '../types/UserScopeReferenceData.js'
import { GithubWorkflowSummary } from '../types/GithubSummaries.js'
import { AppState } from '../../environment/AppState.js'
import { getPersistedUserSettingsOrDefaults } from './persistedUserSettings.js'
import {
  getAccountStructure,
  getRepoStructureFromAccount,
  getWorkflowFromRepo
} from '../github/userScopeReferenceData.js'
import { logger } from '../../util/logging.js'
import { GithubAccountId } from '../types/GithubAccountId.js'
import { GithubRepoId } from '../types/GithubRepoId.js'
import { GithubWorkflowId } from '../types/GithubWorkflowId.js'

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
  const accountsSettings: Record<GithubAccountId, DisplayableGithubAccountSettings> = {}
  for (const [accountId, accountSettings] of Object.entries(userSettings.github.accounts)) {
    const account = getAccountStructure(refData, accountId as GithubAccountId)
    if (account) {
      accountsSettings[accountId as GithubAccountId] = toDisplayableAccountSettings(accountSettings, account)
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
  const reposSettings: Record<GithubRepoId, DisplayableGithubRepoSettings> = {}
  for (const [repoId, repoSettings] of Object.entries(accountSettings.repos)) {
    const repo = getRepoStructureFromAccount(account, {
      accountId: account.accountId,
      repoId: repoId as GithubRepoId
    })
    if (repo) {
      reposSettings[repoId as GithubRepoId] = toDisplayableRepoSettings(repoSettings, repo)
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
  const workflowsSettings: Record<GithubWorkflowId, DisplayableGithubWorkflowSettings> = {}
  for (const [workflowId, workflowSettings] of Object.entries(repoSettings.workflows)) {
    const workflow = getWorkflowFromRepo(repo, {
      ...repo,
      workflowId: workflowId as GithubWorkflowId
    })
    if (workflow) {
      workflowsSettings[workflowId as GithubWorkflowId] = toDisplayableWorkflowSettings(
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
  workflow: GithubWorkflowSummary
) {
  return {
    name: workflow.workflowName,
    ...workflowSettings
  }
}
