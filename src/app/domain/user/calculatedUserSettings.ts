import {
  CalculatedGithubAccountSettings,
  CalculatedGithubRepoSettings,
  CalculatedGithubWorkflowSettings,
  CalculatedUserSettings,
  CalculatedVisibleAndNotifyConfigurable,
  PersistedGithubAccountSettings,
  PersistedGithubRepoSettings,
  PersistedUserSettings,
  PersistedVisibleAndNotifyConfigurable
} from '../types/UserSettings'
import { GithubWorkflow } from '../types/GithubWorkflow'
import { GithubAccountId, GithubRepoId, GithubRepoKey, GithubWorkflowId } from '../types/GithubKeys'
import {
  findUniqueAccountIds,
  findUniqueRepoIdsForAccount,
  findWorkflowsForRepo
} from '../github/githubWorkflow'

const DEFAULT_ACCOUNT_NOTIFY = true

export function calculateUserSettings(
  settings: PersistedUserSettings,
  allWorkflows: GithubWorkflow[]
): CalculatedUserSettings {
  const accountEntries: [GithubAccountId, CalculatedGithubAccountSettings][] = findUniqueAccountIds(
    allWorkflows
  ).map((id) => {
    return [id, calculateAccountSettings(settings.github.accounts.get(id), id, allWorkflows)]
  })

  return {
    userId: settings.userId,
    github: {
      accounts: new Map<GithubAccountId, CalculatedGithubAccountSettings>(accountEntries)
    }
  }
}

export function calculateAccountSettings(
  settings: PersistedGithubAccountSettings | undefined,
  accountId: GithubAccountId,
  allWorkflows: GithubWorkflow[]
): CalculatedGithubAccountSettings {
  const visibleAndNotify = calculateVisibleAndNotifyConfigurable(settings, DEFAULT_ACCOUNT_NOTIFY)

  if (!visibleAndNotify.visible) {
    return { ...visibleAndNotify, repos: new Map<GithubRepoId, CalculatedGithubRepoSettings>() }
  }

  return {
    ...visibleAndNotify,
    repos: new Map<GithubRepoId, CalculatedGithubRepoSettings>(
      findUniqueRepoIdsForAccount(allWorkflows, accountId).map((repoId) => {
        return [
          repoId,
          calculateRepoSettings(
            settings?.repos.get(repoId),
            { ownerId: accountId, repoId },
            allWorkflows,
            visibleAndNotify.notify
          )
        ]
      })
    )
  }
}

export function calculateRepoSettings(
  repoSettings: PersistedGithubRepoSettings | undefined,
  repoKey: GithubRepoKey,
  allWorkflows: GithubWorkflow[],
  defaultNotify: boolean
): CalculatedGithubRepoSettings {
  const visibleAndNotify = calculateVisibleAndNotifyConfigurable(repoSettings, defaultNotify)

  if (!visibleAndNotify.visible) {
    return { ...visibleAndNotify, workflows: new Map<GithubWorkflowId, CalculatedGithubWorkflowSettings>() }
  }

  return {
    ...visibleAndNotify,
    workflows: new Map<GithubWorkflowId, CalculatedGithubWorkflowSettings>(
      findWorkflowsForRepo(allWorkflows, repoKey).map((wf) => {
        return [
          wf.workflowId,
          calculateWorkflowSettings(repoSettings?.workflows.get(wf.workflowId), visibleAndNotify.notify)
        ]
      })
    )
  }
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
