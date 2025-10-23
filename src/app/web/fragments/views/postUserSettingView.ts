import { fragmentViewResult } from '../../viewResultWrappers.js'
import { accountControlsRow, repoControlsRow, workflowControlsRow } from './getUserSettingsView.js'
import { GithubRepoKey, GithubWorkflowKey } from '../../../domain/types/GithubKeys.js'
import {
  DisplayableGithubAccountSettings,
  DisplayableGithubRepoSettings,
  DisplayableGithubWorkflowSettings
} from '../../../domain/types/UserSettings.js'
import { GitHubAccountId } from '../../../types/GitHubIdTypes.js'

export function createUpdateUserAccountSettingResponse(
  accountId: GitHubAccountId,
  settings: DisplayableGithubAccountSettings
) {
  return fragmentViewResult(accountControlsRow(accountId, settings))
}

export function createUpdateUserRepoSettingResponse(
  repoKey: GithubRepoKey,
  settings: DisplayableGithubRepoSettings
) {
  return fragmentViewResult(repoControlsRow(repoKey, settings))
}

export function createUpdateUserWorkflowSettingResponse(
  workflowKey: GithubWorkflowKey,
  settings: DisplayableGithubWorkflowSettings
) {
  return fragmentViewResult(workflowControlsRow(workflowKey, settings))
}
