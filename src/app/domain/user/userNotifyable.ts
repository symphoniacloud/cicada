import { AppState } from '../../environment/AppState'
import { GithubUserId } from '../types/GithubKeys'
import { calculateUserSettings } from './calculatedUserSettings'
import { getUserSettings } from './persistedUserSettings'
import { logger } from '../../util/logging'
import { GithubWorkflow } from '../types/GithubWorkflow'

export async function filterWorkflowNotifyEnabled(
  appState: AppState,
  userIds: GithubUserId[],
  workflow: GithubWorkflow
): Promise<GithubUserId[]> {
  const enabledUserIds = []
  for (const userId of userIds) {
    if (await getWorkflowNotifyEnabledForUser(appState, userId, workflow)) {
      enabledUserIds.push(userId)
    }
  }
  return enabledUserIds
}

async function getWorkflowNotifyEnabledForUser(
  appState: AppState,
  userId: GithubUserId,
  workflow: GithubWorkflow
) {
  // We can use the workflow event as the list of all repos and workflows for the sake of calculating notifyibilty
  const userSettings = calculateUserSettings(await getUserSettings(appState, userId), [workflow], [workflow])
  const yesNotify =
    userSettings.github.accounts[workflow.accountId]?.repos[workflow.repoId]?.workflows[workflow.workflowId]
      .notify
  if (yesNotify === undefined) {
    logger.warn(`No calculated user notify setting for workflow`, { workflow, userSettings })
    return false
  }
  return yesNotify
}
