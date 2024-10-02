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
import { GithubRepoKey, GithubWorkflowKey } from '../types/GithubKeys'
import { findWorkflowName } from '../github/githubWorkflow'
import { calculateUserSettings } from './calculatedUserSettings'
import { findAccountNameFromRepositories, findRepoNameFromRepositories } from '../github/githubRepo'
import { GithubAccountId } from '../types/GithubAccountId'
import { GithubRepoId } from '../types/GithubRepoId'
import { GithubWorkflowId } from '../types/GithubWorkflowId'
import { GithubRepoSummary } from '../types/GithubSummaries'

export function toCalculatedAndDisplayableUserSettings(
  userSettings: PersistedUserSettings,
  allRepoSummaries: GithubRepoSummary[],
  workflows: GithubWorkflow[]
): DisplayableUserSettings {
  return toDisplayableUserSettings(
    calculateUserSettings(userSettings, allRepoSummaries, workflows),
    allRepoSummaries,
    workflows
  )
}

function toDisplayableUserSettings(
  userSettings: CalculatedUserSettings,
  allRepoSummaries: GithubRepoSummary[],
  workflows: GithubWorkflow[]
): DisplayableUserSettings {
  return {
    userId: userSettings.userId,
    github: {
      accounts: Object.fromEntries(
        Object.entries(userSettings.github.accounts).map(([accountId, accountSettings]) => [
          accountId as GithubAccountId,
          toDisplayableAccountSettings(
            accountId as GithubAccountId,
            accountSettings,
            allRepoSummaries,
            workflows
          )
        ])
      )
    }
  }
}

export function toDisplayableAccountSettings(
  accountId: GithubAccountId,
  accountSettings: CalculatedGithubAccountSettings,
  allRepoSummaries: GithubRepoSummary[],
  allWorkflows: GithubWorkflow[]
): DisplayableGithubAccountSettings {
  return {
    ...accountSettings,
    name: findAccountNameFromRepositories(allRepoSummaries, accountId),
    repos: Object.fromEntries(
      Object.entries(accountSettings.repos).map(([repoId, repoSettings]) => [
        repoId as GithubRepoId,
        toDisplayableRepoSettings(
          {
            accountId: accountId,
            repoId: repoId as GithubRepoId
          },
          repoSettings,
          allRepoSummaries,
          allWorkflows
        )
      ])
    )
  }
}

export function toDisplayableRepoSettings(
  repoKey: GithubRepoKey,
  repoSettings: CalculatedGithubRepoSettings,
  allRepoSummaries: GithubRepoSummary[],
  allWorkflows: GithubWorkflow[]
): DisplayableGithubRepoSettings {
  return {
    ...repoSettings,
    name: findRepoNameFromRepositories(allRepoSummaries, repoKey),
    workflows: Object.fromEntries(
      Object.entries(repoSettings.workflows).map(([workflowId, workflowSettings]) => [
        workflowId,
        toDisplayableWorkflowSettings(
          { ...repoKey, workflowId: workflowId as GithubWorkflowId },
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
