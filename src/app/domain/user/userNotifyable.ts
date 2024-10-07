import { AppState } from '../../environment/AppState'
import { GithubUserId } from '../types/GithubUserId'
import { logger } from '../../util/logging'
import { loadCalculatedUserSettingsOrUseDefaults } from './calculatedUserSettings'

import { UserScopeReferenceData } from '../types/UserScopeReferenceData'
import { GithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent'
import { GithubWorkflowSummary } from '../types/GithubSummaries'

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
