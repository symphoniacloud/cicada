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
import { GithubWorkflow } from '../types/GithubWorkflow'
import { GithubAccountId, GithubRepoKey, GithubWorkflowKey } from '../types/GithubKeys'
import { findAccountName, findRepoName, findWorkflowName } from '../github/githubWorkflow'
import { calculateUserSettings } from './calculatedUserSettings'

export function toCalculatedAndDisplayableUserSettings(
  userSettings: PersistedUserSettings,
  workflows: GithubWorkflow[]
): DisplayableUserSettings {
  return toDisplayableUserSettings(calculateUserSettings(userSettings, workflows), workflows)
}

function toDisplayableUserSettings(
  userSettings: CalculatedUserSettings,
  workflows: GithubWorkflow[]
): DisplayableUserSettings {
  return {
    userId: userSettings.userId,
    github: {
      accounts: Object.fromEntries(
        Object.entries(userSettings.github.accounts).map(([accountId, accountSettings]) => [
          accountId,
          toDisplayableAccountSettings(Number(accountId), accountSettings, workflows)
        ])
      )
    }
  }
}

export function toDisplayableAccountSettings(
  accountId: GithubAccountId,
  accountSettings: CalculatedGithubAccountSettings,
  allWorkflows: GithubWorkflow[]
): DisplayableGithubAccountSettings {
  return {
    ...accountSettings,
    name: findAccountName(allWorkflows, accountId),
    repos: Object.fromEntries(
      Object.entries(accountSettings.repos).map(([repoId, repoSettings]) => [
        repoId,
        toDisplayableRepoSettings(
          {
            ownerId: accountId,
            repoId: Number(repoId)
          },
          repoSettings,
          allWorkflows
        )
      ])
    )
  }
}

export function toDisplayableRepoSettings(
  repoKey: GithubRepoKey,
  repoSettings: CalculatedGithubRepoSettings,
  allWorkflows: GithubWorkflow[]
): DisplayableGithubRepoSettings {
  return {
    ...repoSettings,
    name: findRepoName(allWorkflows, repoKey),
    workflows: Object.fromEntries(
      Object.entries(repoSettings.workflows).map(([workflowId, workflowSettings]) => [
        workflowId,
        toDisplayableWorkflowSettings(
          { ...repoKey, workflowId: Number(workflowId) },
          workflowSettings,
          allWorkflows
        )
      ])
    )
  }
}

export function toDisplayableWorkflowSettings(
  workflowKey: GithubWorkflowKey,
  workflowSettings: CalculatedGithubWorkflowSettings,
  allWorkflows: GithubWorkflow[]
): DisplayableGithubWorkflowSettings {
  return {
    ...workflowSettings,
    name: findWorkflowName(allWorkflows, workflowKey)
  }
}
