import { AppState } from '../../environment/AppState'
import {
  DisplayableGithubAccountSettings,
  DisplayableGithubRepoSettings,
  DisplayableGithubWorkflowSettings,
  DisplayableUserSettings,
  GithubAccountSettings,
  GithubRepoSettings,
  GithubWorkflowSettings,
  UserSettings
} from '../types/UserSettings'
import { getWorkflowsForUser } from './userVisible'
import { getUserSettingsOrDefaultsForAllWorkflows } from './userSettings'
import { GithubWorkflow } from '../types/GithubWorkflow'
import { GithubAccountId, GithubRepoId, GithubWorkflowId } from '../types/GithubKeys'
import { findAccountName, findRepoName, findWorkflowName } from '../github/githubWorkflow'

export async function getDisplayableUserSettingsOrDefaultsForAllWorkflows(
  appState: AppState,
  userId: number
): Promise<DisplayableUserSettings> {
  const workflows = await getWorkflowsForUser(appState, userId)
  const userSettings = await getUserSettingsOrDefaultsForAllWorkflows(appState, userId, workflows)
  return toDisplayableUserSettings(userSettings, workflows)
}

export function toDisplayableUserSettings(
  userSettings: UserSettings,
  workflows: GithubWorkflow[]
): DisplayableUserSettings {
  return {
    github: {
      accounts: toDisplayableAccounts(userSettings.github.accounts, workflows)
    }
  }
}

function toDisplayableAccounts(
  accounts: Map<GithubAccountId, GithubAccountSettings>,
  workflows: GithubWorkflow[]
) {
  const displayableAccounts = new Map<GithubAccountId, DisplayableGithubAccountSettings>()
  for (const [accountId, accountSettings] of accounts) {
    displayableAccounts.set(accountId, toDisplayableAccountSettings(accountId, accountSettings, workflows))
  }
  return displayableAccounts
}

function toDisplayableAccountSettings(
  accountId: GithubAccountId,
  accountSettings: GithubAccountSettings,
  workflows: GithubWorkflow[]
) {
  return {
    name: findAccountName(workflows, accountId),
    visible: accountSettings.visible ?? true,
    notify: accountSettings.notify ?? true,
    // If account isn't visible, don't show repos in settings
    repos: accountSettings.visible
      ? toDisplayableRepos(accountSettings.repos, accountId, workflows)
      : new Map<GithubRepoId, DisplayableGithubRepoSettings>()
  }
}

function toDisplayableRepos(
  repos: Map<GithubRepoId, GithubRepoSettings>,
  accountId: GithubAccountId,
  workflows: GithubWorkflow[]
) {
  const displayableRepos = new Map<GithubRepoId, DisplayableGithubRepoSettings>()
  for (const [repoId, repoSettings] of repos) {
    displayableRepos.set(repoId, toDisplayableRepoSettings(accountId, repoId, repoSettings, workflows))
  }
  return displayableRepos
}

function toDisplayableRepoSettings(
  accountId: GithubAccountId,
  repoId: GithubRepoId,
  repoSettings: GithubRepoSettings,
  allWorkflows: GithubWorkflow[]
) {
  return {
    name: findRepoName(allWorkflows, accountId, repoId),
    visible: repoSettings.visible ?? true,
    notify: repoSettings.notify ?? true,
    workflows: repoSettings.visible
      ? toDisplayableWorkflows(repoSettings.workflows, accountId, repoId, allWorkflows)
      : new Map<GithubWorkflowId, DisplayableGithubWorkflowSettings>()
  }
}

function toDisplayableWorkflows(
  workflows: Map<GithubWorkflowId, GithubWorkflowSettings>,
  accountId: GithubAccountId,
  repoId: GithubRepoId,
  allWorkflows: GithubWorkflow[]
) {
  const displayableWorkflows = new Map<GithubWorkflowId, DisplayableGithubWorkflowSettings>()
  for (const [workflowId, workflowSettings] of workflows) {
    displayableWorkflows.set(workflowId, {
      name: findWorkflowName(allWorkflows, accountId, repoId, workflowId),
      visible: workflowSettings.visible ?? true,
      notify: workflowSettings.notify ?? true
    })
  }
  return displayableWorkflows
}
