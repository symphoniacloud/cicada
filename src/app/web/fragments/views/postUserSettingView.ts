import { fragmentViewResult } from '../../viewResultWrappers.js'
import { accountControlsRow, repoControlsRow, workflowControlsRow } from './getUserSettingsView.js'
import { GitHubAccountId, GitHubRepoKey, GitHubWorkflowKey } from '../../../ioTypes/GitHubTypes.js'
import {
  DisplayableGithubAccountSettings,
  DisplayableGithubRepoSettings,
  DisplayableGithubWorkflowSettings
} from '../../../domain/types/internalTypes.js'

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
