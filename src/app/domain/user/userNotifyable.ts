import { AppState } from '../../environment/AppState'
import { GithubUserId } from '../types/GithubUserId'
import { logger } from '../../util/logging'
import { GithubWorkflow } from '../types/GithubWorkflow'
import { loadCalculatedUserSettingsOrUseDefaults } from './calculatedUserSettings'
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
  const userSettings = await loadCalculatedUserSettingsOrUseDefaults(appState, userId, installationStructure)
  const yesNotify =
    userSettings.github.accounts[workflow.accountId]?.repos[workflow.repoId]?.workflows[workflow.workflowId]
      .notify
  if (yesNotify === undefined) {
    logger.warn(`No calculated user notify setting for workflow`, { workflow, userSettings })
    return false
  }
  return yesNotify
}
