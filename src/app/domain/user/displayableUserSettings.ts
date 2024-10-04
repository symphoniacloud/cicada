import {
  CalculatedGithubAccountSettings,
  CalculatedGithubRepoSettings,
  CalculatedGithubWorkflowSettings,
  CalculatedUserSettings,
  DisplayableGithubAccountSettings,
  DisplayableGithubRepoSettings,
  DisplayableUserSettings,
  PersistedUserSettings
} from '../types/UserSettings'
import { usableWorkflowName } from '../github/githubWorkflow'
import { calculateUserSettings } from './calculatedUserSettings'
import {
  GithubAccountStructure,
  GithubRepoStructure,
  UserScopeReferenceData
} from '../types/UserScopeReferenceData'
import { objectMap } from '../../util/collections'
import { GithubWorkflowSummary } from '../types/GithubSummaries'
import { AppState } from '../../environment/AppState'
import { getPersistedUserSettingsOrDefaults } from './persistedUserSettings'
import { allAccountsFromRefData } from '../github/userScopeReferenceData'

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
  return {
    userId: userSettings.userId,
    github: {
      accounts: Object.fromEntries(
        allAccountsFromRefData(refData).map((account) => [
          account.accountId,
          toDisplayableAccountSettings(userSettings.github.accounts[account.accountId], account)
        ])
      )
    }
  }
}

export function toDisplayableAccountSettings(
  accountSettings: CalculatedGithubAccountSettings,
  account: GithubAccountStructure
): DisplayableGithubAccountSettings {
  return {
    ...accountSettings,
    name: account.accountName,
    repos: objectMap(account.repos, (repoId, repo) => [
      repoId,
      toDisplayableRepoSettings(accountSettings.repos[repo.repoId], repo)
    ])
  }
}

export function toDisplayableRepoSettings(
  repoSettings: CalculatedGithubRepoSettings,
  repo: GithubRepoStructure
): DisplayableGithubRepoSettings {
  return {
    ...repoSettings,
    name: repo.repoName,
    workflows: objectMap(repo.workflows, (workflowId, workflow) => [
      workflowId,
      toDisplayableWorkflowSettings(repoSettings.workflows[workflow.workflowId], workflow)
    ])
  }
}

export function toDisplayableWorkflowSettings(
  workflowSettings: CalculatedGithubWorkflowSettings,
  workflow: GithubWorkflowSummary
) {
  return {
    name: usableWorkflowName(workflow),
    ...workflowSettings
  }
}
