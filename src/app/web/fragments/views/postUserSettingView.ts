import { fragmentViewResult } from '../../viewResultWrappers'
import { accountControlsRow, repoControlsRow, workflowControlsRow } from './getUserSettingsView'
import { GithubRepoKey, GithubWorkflowKey } from '../../../domain/types/GithubKeys'
import {
  DisplayableGithubAccountSettings,
  DisplayableGithubRepoSettings,
  DisplayableGithubWorkflowSettings
} from '../../../domain/types/UserSettings'
import { GithubAccountId } from '../../../domain/types/GithubAccountId'

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
