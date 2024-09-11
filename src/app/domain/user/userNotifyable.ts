import { AppState } from '../../environment/AppState'
import { GithubUserId, GithubWorkflowKey } from '../types/GithubKeys'
import { calculateUserSettings } from './calculatedUserSettings'
import { getUserSettings } from './persistedUserSettings'
import { getWorkflowsForUser } from './userVisible'
import { logger } from '../../util/logging'

export async function filterWorkflowNotifyEnabled(
  appState: AppState,
  userIds: GithubUserId[],
  workflow: GithubWorkflowKey
): Promise<GithubUserId[]> {
  const enabledUserIds = []
  for (const userId of userIds) {
    if (await getWorkflowNotifyEnabledForUser(appState, userId, workflow)) {
      enabledUserIds.push(userId)
    }
  }
  return enabledUserIds
}

export async function getWorkflowNotifyEnabledForUser(
  appState: AppState,
  userId: GithubUserId,
  workflow: GithubWorkflowKey
) {
  const userSettings = calculateUserSettings(
    await getUserSettings(appState, userId),
    await getWorkflowsForUser(appState, userId)
  )
  const yesNotify = userSettings.github.accounts
    .get(workflow.ownerId)
    ?.repos.get(workflow.repoId)
    ?.workflows.get(workflow.workflowId)?.notify
  if (yesNotify === undefined) {
    logger.warn(`No calculated user notify setting for workflow`, { workflow, userSettings })
    return false
  }
  return yesNotify
}
