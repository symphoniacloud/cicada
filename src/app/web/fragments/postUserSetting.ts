import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { AppState } from '../../environment/AppState'
import {
  createUpdateUserAccountSettingResponse,
  createUpdateUserRepoSettingResponse,
  createUpdateUserWorkflowSettingResponse
} from './views/postUserSettingView'
import { logger } from '../../util/logging'
import { getPostUserSettingParameters } from './requestParsing/getPostUserSettingParameters'
import { isFailure } from '../../util/structuredResult'
import { invalidRequestResponse } from '../htmlResponses'
import { GithubRepoKey, GithubWorkflowKey } from '../../domain/types/GithubKeys'
import {
  toDisplayableAccountSettings,
  toDisplayableRepoSettings,
  toDisplayableWorkflowSettings
} from '../../domain/user/displayableUserSettings'
import { throwFunction } from '../../../multipleContexts/errors'
import {
  getUserSettings,
  updateAndSaveAccountSetting,
  updateAndSaveRepoSetting,
  updateAndSaveWorkflowSetting
} from '../../domain/user/persistedUserSettings'
import { UserSetting } from '../../domain/types/UserSettings'
import { fragmentPath } from '../routingCommon'
import { GithubAccountId } from '../../domain/types/GithubAccountId'
import { GithubUserId } from '../../domain/types/GithubUserId'
import { calculateAccountSettings, calculateUserSettings } from '../../domain/user/calculatedUserSettings'
import {
  accountStructureFromInstallationAccountStructure,
  loadInstallationAccountStructureForUser,
  repoStructureFromInstallationAccountStructure,
  workflowSummaryFromInstallationAccountStructure
} from '../../domain/github/githubAccountStructure'
import { GithubInstallationAccountStructure } from '../../domain/types/GithubAccountStructure'

export const postUserSettingFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('userSetting'),
  method: 'POST',
  target: updateUserSetting
}

export async function updateUserSetting(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  console.log(event.queryStringParameters)
  const parseResult = getPostUserSettingParameters(event)
  if (isFailure(parseResult)) return parseResult.failureResult

  const { accountId, repoId, workflowId, setting, enabled } = parseResult.result
  const installationAccount = await loadInstallationAccountStructureForUser(appState, event.userId)

  if (workflowId) {
    if (!repoId) {
      logger.warn('Workflow ID but no repo ID')
      return invalidRequestResponse
    }
    return processUpdateWorkflowSetting(
      appState,
      installationAccount,
      event.userId,
      { accountId: accountId, repoId, workflowId },
      setting,
      enabled
    )
  }
  if (repoId) {
    return processUpdateRepoSetting(
      appState,
      installationAccount,
      event.userId,
      { accountId: accountId, repoId },
      setting,
      enabled
    )
  }

  return processUpdateAccountSetting(appState, installationAccount, event.userId, accountId, setting, enabled)
}

async function processUpdateAccountSetting(
  appState: AppState,
  installationAccount: GithubInstallationAccountStructure,
  userId: GithubUserId,
  accountId: GithubAccountId,
  setting: UserSetting,
  enabled: boolean
) {
  logger.debug('processUpdateAccountSetting')
  const updatedSettings = await updateAndSaveAccountSetting(appState, userId, accountId, setting, enabled)
  const updatedAccountSettings =
    updatedSettings.github.accounts[accountId] ??
    throwFunction('Internal error in processUpdateAccountSetting - no account settings')()

  // TODO - will throw if account ID not known - need to handle and/or change to undefined
  const accountStructure = accountStructureFromInstallationAccountStructure(installationAccount, accountId)
  return createUpdateUserAccountSettingResponse(
    accountId,
    toDisplayableAccountSettings(
      calculateAccountSettings(updatedAccountSettings, accountStructure),
      accountStructure
    )
  )
}

async function processUpdateRepoSetting(
  appState: AppState,
  installationAccount: GithubInstallationAccountStructure,
  userId: GithubUserId,
  repoKey: GithubRepoKey,
  setting: UserSetting,
  enabled: boolean
) {
  logger.debug('processUpdateRepoSetting')
  await updateAndSaveRepoSetting(appState, userId, repoKey, setting, enabled)

  const newPersistedUserSettings = await getUserSettings(appState, userId)
  const newCalculatedUserSettings = calculateUserSettings(newPersistedUserSettings, installationAccount)
  const newCalculatedRepoSettings =
    newCalculatedUserSettings.github.accounts[repoKey.accountId]?.repos[repoKey.repoId] ??
    throwFunction('Internal error in processUpdateRepoSetting - no repo settings')()

  return createUpdateUserRepoSettingResponse(
    repoKey,
    toDisplayableRepoSettings(
      newCalculatedRepoSettings,
      repoStructureFromInstallationAccountStructure(installationAccount, repoKey)
    )
  )
}

async function processUpdateWorkflowSetting(
  appState: AppState,
  installationAccount: GithubInstallationAccountStructure,
  userId: GithubUserId,
  workflowKey: GithubWorkflowKey,
  setting: UserSetting,
  enabled: boolean
) {
  logger.debug('processUpdateWorkflowSetting')
  await updateAndSaveWorkflowSetting(appState, userId, workflowKey, setting, enabled)

  const newPersistedUserSettings = await getUserSettings(appState, userId)

  const newCalculatedUserSettings = calculateUserSettings(newPersistedUserSettings, installationAccount)
  const newCalculatedWorkflowSettings =
    newCalculatedUserSettings.github.accounts[workflowKey.accountId]?.repos[workflowKey.repoId]?.workflows[
      workflowKey.workflowId
    ] ?? throwFunction('Internal error in processUpdateWorkflowSetting - no workflow settings')()

  // TODO - think about validating values of IDs

  return createUpdateUserWorkflowSettingResponse(
    workflowKey,
    toDisplayableWorkflowSettings(
      newCalculatedWorkflowSettings,
      workflowSummaryFromInstallationAccountStructure(installationAccount, workflowKey)
    )
  )
}
