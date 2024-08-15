import {
  CalculatedGithubAccountSettings,
  CalculatedGithubRepoSettings,
  CalculatedGithubWorkflowSettings,
  CalculatedUserSettings,
  CalculatedVisibleAndNotifyConfigurable,
  PersistedGithubAccountSettings,
  PersistedGithubRepoSettings,
  PersistedGithubWorkflowSettings,
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

export function calculateUserSettings(
  settings: PersistedUserSettings,
  allWorkflows: GithubWorkflow[]
): CalculatedUserSettings {
  const accountEntries: [GithubAccountId, CalculatedGithubAccountSettings][] = findUniqueAccountIds(
    allWorkflows
  ).map((accountId) => {
    return [
      accountId,
      calculateAccountSettings(settings.github.accounts.get(accountId), accountId, allWorkflows)
    ]
  })

  return {
    userId: settings.userId,
    github: {
      accounts: new Map<GithubAccountId, CalculatedGithubAccountSettings>(accountEntries)
    }
  }
}

// TODO - if notify is NOT specified, parent notify is active
//    If notify IS specified, use it

export function calculateAccountSettings(
  settings: PersistedGithubAccountSettings | undefined,
  accountId: GithubAccountId,
  allWorkflows: GithubWorkflow[]
): CalculatedGithubAccountSettings {
  const visibleAndNotify = calculateVisibleAndNotifyConfigurable(settings)
  const repoEntries: [GithubRepoId, CalculatedGithubRepoSettings][] = visibleAndNotify.visible
    ? findUniqueRepoIdsForAccount(allWorkflows, accountId).map((repoId) => {
        return [
          repoId,
          calculateRepoSettings(
            {
              ...settings?.repos.get(repoId),
              ...(!visibleAndNotify.notify ? { notify: false } : {}),
              workflows:
                settings?.repos.get(repoId)?.workflows ??
                new Map<GithubWorkflowId, PersistedGithubWorkflowSettings>()
            },
            { ownerId: accountId, repoId },
            allWorkflows
          )
        ]
      })
    : []
  return {
    ...visibleAndNotify,
    repos: new Map<GithubRepoId, CalculatedGithubRepoSettings>(repoEntries)
  }
}

export function calculateRepoSettings(
  settings: PersistedGithubRepoSettings | undefined,
  repoKey: GithubRepoKey,
  allWorkflows: GithubWorkflow[]
): CalculatedGithubRepoSettings {
  const visibleAndNotify = calculateVisibleAndNotifyConfigurable(settings)
  const workflowEntries: [GithubWorkflowId, CalculatedGithubWorkflowSettings][] = visibleAndNotify.visible
    ? findWorkflowsForRepo(allWorkflows, repoKey).map((wf) => {
        return [
          wf.workflowId,
          calculateWorkflowSettings({
            ...settings?.workflows.get(wf.workflowId),
            ...(!visibleAndNotify.notify ? { notify: false } : {})
          })
        ]
      })
    : []
  return {
    ...visibleAndNotify,
    workflows: new Map<GithubWorkflowId, CalculatedGithubWorkflowSettings>(workflowEntries)
  }
}

export const calculateWorkflowSettings = calculateVisibleAndNotifyConfigurable

export function calculateVisibleAndNotifyConfigurable(
  settings: PersistedVisibleAndNotifyConfigurable | undefined
): CalculatedVisibleAndNotifyConfigurable {
  const visible = settings?.visible ?? true
  return {
    visible,
    notify: visible && (settings?.notify ?? true)
  }
}
