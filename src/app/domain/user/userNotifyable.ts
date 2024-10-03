import { AppState } from '../../environment/AppState'
import { GithubUserId } from '../types/GithubUserId'
import { getUserSettings } from './persistedUserSettings'
import { logger } from '../../util/logging'
import { GithubWorkflow } from '../types/GithubWorkflow'
import { calculateUserSettings } from './calculatedUserSettings'
import { GithubInstallationAccountStructure } from '../types/GithubAccountStructure'

export async function filterWorkflowNotifyEnabled(
  appState: AppState,
  installationStructure: GithubInstallationAccountStructure,
  userIds: GithubUserId[],
  workflow: GithubWorkflow
): Promise<GithubUserId[]> {
  const enabledUserIds: GithubUserId[] = []
  for (const userId of userIds) {
    if (await getWorkflowNotifyEnabledForUser(appState, userId, workflow, installationStructure)) {
      enabledUserIds.push(userId)
    }
  }
  return enabledUserIds
}

async function getWorkflowNotifyEnabledForUser(
  appState: AppState,
  userId: GithubUserId,
  workflow: GithubWorkflow,
  installationStructure: GithubInstallationAccountStructure
) {
  const userSettings = calculateUserSettings(await getUserSettings(appState, userId), installationStructure)
  const yesNotify =
    userSettings.github.accounts[workflow.accountId]?.repos[workflow.repoId]?.workflows[workflow.workflowId]
      .notify
  if (yesNotify === undefined) {
    logger.warn(`No calculated user notify setting for workflow`, { workflow, userSettings })
    return false
  }
  return yesNotify
}
