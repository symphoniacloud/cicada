import {
  CalculatedGithubAccountSettings,
  CalculatedGithubRepoSettings,
  CalculatedGithubWorkflowSettings,
  CalculatedUserSettings,
  DisplayableGithubAccountSettings,
  DisplayableGithubRepoSettings,
  DisplayableGithubWorkflowSettings,
  DisplayableUserSettings
} from '../types/UserSettings'
import { GithubWorkflow } from '../types/GithubWorkflow'
import {
  GithubAccountId,
  GithubRepoId,
  GithubRepoKey,
  GithubWorkflowId,
  GithubWorkflowKey
} from '../types/GithubKeys'
import { findAccountName, findRepoName, findWorkflowName } from '../github/githubWorkflow'

export function toDisplayableUserSettings(
  userSettings: CalculatedUserSettings,
  workflows: GithubWorkflow[]
): DisplayableUserSettings {
  return {
    github: {
      accounts: new Map<GithubAccountId, DisplayableGithubAccountSettings>(
        Array.from(userSettings.github.accounts.entries()).map(([accountId, accountSettings]) => [
          accountId,
          toDisplayableAccountSettings(accountId, accountSettings, workflows)
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
    repos: new Map<GithubRepoId, DisplayableGithubRepoSettings>(
      Array.from(accountSettings.repos.entries()).map(([repoId, repoSettings]) => [
        repoId,
        toDisplayableRepoSettings(
          {
            ownerId: accountId,
            repoId
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
    workflows: new Map<GithubWorkflowId, DisplayableGithubWorkflowSettings>(
      Array.from(repoSettings.workflows.entries()).map(([workflowId, workflowSettings]) => [
        workflowId,
        toDisplayableWorkflowSettings({ ...repoKey, workflowId }, workflowSettings, allWorkflows)
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
