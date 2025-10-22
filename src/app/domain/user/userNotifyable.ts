import { AppState } from '../../environment/AppState.js'
import { GithubUserId } from '../types/GithubUserId.js'
import { logger } from '../../util/logging.js'
import { loadCalculatedUserSettingsOrUseDefaults } from './calculatedUserSettings.js'

import { UserScopeReferenceData } from '../types/UserScopeReferenceData.js'
import { GithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent.js'
import { GithubWorkflowSummary } from '../types/GithubSummaries.js'
import { GithubRepoKey } from '../types/GithubKeys.js'

export async function filterWorkflowNotifyEnabled(
  appState: AppState,
  refData: UserScopeReferenceData,
  userIds: GithubUserId[],
  workflowRun: GithubWorkflowRunEvent
): Promise<GithubUserId[]> {
  const enabledUserIds: GithubUserId[] = []
  for (const userId of userIds) {
    if (
      // TODO - don't do this! This is a hack while all users have same visibility to
      //   avoid a huge amount of queries for large accounts
      //   What we want instead is some caching for underlying ref data objects
      await getWorkflowNotifyEnabledForUser(appState, workflowRun, {
        ...refData,
        userId
      })
    ) {
      enabledUserIds.push(userId)
    }
  }
  return enabledUserIds
}

async function getWorkflowNotifyEnabledForUser(
  appState: AppState,
  workflow: GithubWorkflowSummary,
  refData: UserScopeReferenceData
) {
  const userSettings = await loadCalculatedUserSettingsOrUseDefaults(appState, refData)
  const yesNotify =
    userSettings.github.accounts[workflow.accountId]?.repos[workflow.repoId]?.workflows[workflow.workflowId]
      .notify
  if (yesNotify === undefined) {
    logger.warn(`No calculated user notify setting for workflow`, { workflow, userSettings })
    return false
  }
  return yesNotify
}

export async function filterRepoNotifyEnabled(
  appState: AppState,
  refData: UserScopeReferenceData,
  userIds: GithubUserId[],
  repo: GithubRepoKey
): Promise<GithubUserId[]> {
  const enabledUserIds: GithubUserId[] = []
  for (const userId of userIds) {
    if (
      // TODO - don't do this! This is a hack while all users have same visibility to
      //   avoid a huge amount of queries for large accounts
      //   What we want instead is some caching for underlying ref data objects
      await getRepoNotifyEnabledForUser(appState, repo, {
        ...refData,
        userId
      })
    ) {
      enabledUserIds.push(userId)
    }
  }
  return enabledUserIds
}

async function getRepoNotifyEnabledForUser(
  appState: AppState,
  repo: GithubRepoKey,
  refData: UserScopeReferenceData
) {
  const userSettings = await loadCalculatedUserSettingsOrUseDefaults(appState, refData)
  const yesNotify = userSettings.github.accounts[repo.accountId]?.repos[repo.repoId].notify
  if (yesNotify === undefined) {
    logger.warn(`No calculated user notify setting for repo`, { repo, userSettings })
    return false
  }
  return yesNotify
}
