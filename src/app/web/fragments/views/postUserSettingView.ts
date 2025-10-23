import { fragmentViewResult } from '../../viewResultWrappers.js'
import { accountControlsRow, repoControlsRow, workflowControlsRow } from './getUserSettingsView.js'
import {
  DisplayableGithubAccountSettings,
  DisplayableGithubRepoSettings,
  DisplayableGithubWorkflowSettings
} from '../../../domain/types/UserSettings.js'
import { GitHubAccountId } from '../../../types/GitHubIdTypes.js'
import { GitHubRepoKey, GitHubWorkflowKey } from '../../../types/GitHubKeyTypes.js'

export function createUpdateUserAccountSettingResponse(
  accountId: GitHubAccountId,
  settings: DisplayableGithubAccountSettings
) {
  return fragmentViewResult(accountControlsRow(accountId, settings))
}

export function createUpdateUserRepoSettingResponse(
  repoKey: GitHubRepoKey,
  settings: DisplayableGithubRepoSettings
) {
  return fragmentViewResult(repoControlsRow(repoKey, settings))
}

export function createUpdateUserWorkflowSettingResponse(
  workflowKey: GitHubWorkflowKey,
  settings: DisplayableGithubWorkflowSettings
) {
  return fragmentViewResult(workflowControlsRow(workflowKey, settings))
}
