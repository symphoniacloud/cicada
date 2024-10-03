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
  GithubInstallationAccountStructure,
  GithubRepoStructure
} from '../types/GithubAccountStructure'
import { objectMap } from '../../util/collections'
import { GithubWorkflowSummary } from '../types/GithubSummaries'

export function toCalculatedAndDisplayableUserSettings(
  userSettings: PersistedUserSettings,
  installationAccount: GithubInstallationAccountStructure
): DisplayableUserSettings {
  return toDisplayableUserSettings(
    calculateUserSettings(userSettings, installationAccount),
    installationAccount
  )
}

function toDisplayableUserSettings(
  userSettings: CalculatedUserSettings,
  installationAccount: GithubInstallationAccountStructure
): DisplayableUserSettings {
  return {
    userId: userSettings.userId,
    github: {
      accounts: Object.fromEntries(
        [installationAccount, ...Object.values(installationAccount.publicAccounts)].map((account) => [
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
