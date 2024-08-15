import { fragmentViewResult } from '../../viewResultWrappers'
import { accountControlsRow, repoControlsRow, workflowControlsRow } from './getUserSettingsView'
import { GithubAccountId, GithubRepoKey, GithubWorkflowKey } from '../../../domain/types/GithubKeys'
import {
  DisplayableGithubAccountSettings,
  DisplayableGithubRepoSettings,
  DisplayableGithubWorkflowSettings
} from '../../../domain/types/UserSettings'

export function createUpdateUserAccountSettingResponse(
  accountId: GithubAccountId,
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
