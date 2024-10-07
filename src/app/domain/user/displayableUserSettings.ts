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
} from '../types/UserSettings'
import { calculateUserSettings } from './calculatedUserSettings'
import {
  GithubAccountStructure,
  GithubRepoStructure,
  UserScopeReferenceData
} from '../types/UserScopeReferenceData'
import { GithubWorkflowSummary } from '../types/GithubSummaries'
import { AppState } from '../../environment/AppState'
import { getPersistedUserSettingsOrDefaults } from './persistedUserSettings'
import {
  getAccountStructure,
  getRepoStructureFromAccount,
  getWorkflowFromRepo
} from '../github/userScopeReferenceData'
import { logger } from '../../util/logging'
import { GithubAccountId } from '../types/GithubAccountId'
import { GithubRepoId } from '../types/GithubRepoId'
import { GithubWorkflowId } from '../types/GithubWorkflowId'

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
