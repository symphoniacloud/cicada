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
import { GithubWorkflow } from '../types/GithubWorkflow'
import { GithubAccountId, GithubRepoKey } from '../types/GithubKeys'
import { findWorkflowsForRepo } from '../github/githubWorkflow'
import { findUniqueAccountIds, toUniqueRepoIdsForAccount } from '../github/githubRepository'

const DEFAULT_ACCOUNT_NOTIFY = true

export function calculateUserSettings(
  settings: PersistedUserSettings,
  allRepoKeys: GithubRepoKey[],
  allWorkflows: GithubWorkflow[]
): CalculatedUserSettings {
  return {
    userId: settings.userId,
    github: {
      accounts: Object.fromEntries(
        findUniqueAccountIds(allRepoKeys).map((id) => {
          return [id, calculateAccountSettings(settings.github.accounts[id], id, allRepoKeys, allWorkflows)]
        })
      )
    }
  }
}

export function calculateAccountSettings(
  settings: PersistedGithubAccountSettings | undefined,
  accountId: GithubAccountId,
  allRepoKeys: GithubRepoKey[],
  allWorkflows: GithubWorkflow[]
): CalculatedGithubAccountSettings {
  const visibleAndNotify = calculateVisibleAndNotifyConfigurable(settings, DEFAULT_ACCOUNT_NOTIFY)
  const repos = visibleAndNotify.visible
    ? Object.fromEntries(
        toUniqueRepoIdsForAccount(allRepoKeys, accountId).map((repoId) => {
          return [
            repoId,
            calculateRepoSettings(
              settings?.repos[repoId],
              { ownerId: accountId, repoId },
              allWorkflows,
              visibleAndNotify.notify
            )
          ]
        })
      )
    : {}

  return { ...visibleAndNotify, repos }
}

export function calculateRepoSettings(
  repoSettings: PersistedGithubRepoSettings | undefined,
  repoKey: GithubRepoKey,
  allWorkflows: GithubWorkflow[],
  defaultNotify: boolean
): CalculatedGithubRepoSettings {
  const visibleAndNotify = calculateVisibleAndNotifyConfigurable(repoSettings, defaultNotify)
  const workflows = visibleAndNotify.visible
    ? Object.fromEntries(
        findWorkflowsForRepo(allWorkflows, repoKey).map((wf) => {
          return [
            wf.workflowId,
            calculateWorkflowSettings(repoSettings?.workflows[wf.workflowId], visibleAndNotify.notify)
          ]
        })
      )
    : {}

  return { ...visibleAndNotify, workflows }
}

export const calculateWorkflowSettings = calculateVisibleAndNotifyConfigurable

export function calculateVisibleAndNotifyConfigurable(
  settings: PersistedVisibleAndNotifyConfigurable | undefined,
  defaultNotify: boolean
): CalculatedVisibleAndNotifyConfigurable {
  const visible = settings?.visible ?? true
  return {
    visible,
    notify: visible && (settings?.notify ?? defaultNotify)
  }
}
