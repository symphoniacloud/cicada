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
  getPersistedUserSettingsOrDefaults,
  updateAndSaveAccountSetting,
  updateAndSaveRepoSetting,
  updateAndSaveWorkflowSetting
} from '../../domain/user/persistedUserSettings'
import { UserSetting } from '../../domain/types/UserSettings'
import { fragmentPath } from '../routingCommon'
import { GithubAccountId } from '../../domain/types/GithubAccountId'
import { calculateAccountSettings, calculateUserSettings } from '../../domain/user/calculatedUserSettings'
import {
  getAccountStructure,
  getRepoStructure,
  getWorkflowStructure
} from '../../domain/github/userScopeReferenceData'

import { UserScopeReferenceData } from '../../domain/types/UserScopeReferenceData'

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

  if (workflowId) {
    if (!repoId) {
      logger.warn('Workflow ID but no repo ID')
      return invalidRequestResponse
    }
    return processUpdateWorkflowSetting(
      appState,
      event.refData,
      { accountId: accountId, repoId, workflowId },
      setting,
      enabled
    )
  }
  if (repoId) {
    return processUpdateRepoSetting(
      appState,
      event.refData,
      { accountId: accountId, repoId },
      setting,
      enabled
    )
  }

  return processUpdateAccountSetting(appState, event.refData, accountId, setting, enabled)
}

async function processUpdateAccountSetting(
  appState: AppState,
  refData: UserScopeReferenceData,
  accountId: GithubAccountId,
  setting: UserSetting,
  enabled: boolean
) {
  logger.debug('processUpdateAccountSetting')
  const updatedSettings = await updateAndSaveAccountSetting(
    appState,
    refData.userId,
    accountId,
    setting,
    enabled
  )
  const updatedAccountSettings =
    updatedSettings.github.accounts[accountId] ??
    throwFunction('Internal error in processUpdateAccountSetting - no account settings')()

  const accountStructure = getAccountStructure(refData, accountId)
  if (!accountStructure) throw new Error(`No account for account ID ${accountId}`)

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
  refData: UserScopeReferenceData,
  repoKey: GithubRepoKey,
  setting: UserSetting,
  enabled: boolean
) {
  logger.debug('processUpdateRepoSetting')
  await updateAndSaveRepoSetting(appState, refData.userId, repoKey, setting, enabled)

  const newPersistedUserSettings = await getPersistedUserSettingsOrDefaults(appState, refData.userId)
  const newCalculatedUserSettings = calculateUserSettings(newPersistedUserSettings, refData)
  const newCalculatedRepoSettings =
    newCalculatedUserSettings.github.accounts[repoKey.accountId]?.repos[repoKey.repoId] ??
    throwFunction('Internal error in processUpdateRepoSetting - no repo settings')()

  return createUpdateUserRepoSettingResponse(
    repoKey,
    toDisplayableRepoSettings(
      newCalculatedRepoSettings,
      getRepoStructure(refData, repoKey) ?? throwFunction(`No repo for key ${JSON.stringify(repoKey)}`)()
    )
  )
}

async function processUpdateWorkflowSetting(
  appState: AppState,
  refData: UserScopeReferenceData,
  workflowKey: GithubWorkflowKey,
  setting: UserSetting,
  enabled: boolean
) {
  logger.debug('processUpdateWorkflowSetting')
  await updateAndSaveWorkflowSetting(appState, refData.userId, workflowKey, setting, enabled)

  const newPersistedUserSettings = await getPersistedUserSettingsOrDefaults(appState, refData.userId)

  const newCalculatedUserSettings = calculateUserSettings(newPersistedUserSettings, refData)
  const newCalculatedWorkflowSettings =
    newCalculatedUserSettings.github.accounts[workflowKey.accountId]?.repos[workflowKey.repoId]?.workflows[
      workflowKey.workflowId
    ] ?? throwFunction('Internal error in processUpdateWorkflowSetting - no workflow settings')()

  // TODO - think about validating values of IDs

  return createUpdateUserWorkflowSettingResponse(
    workflowKey,
    toDisplayableWorkflowSettings(
      newCalculatedWorkflowSettings,
      getWorkflowStructure(refData, workflowKey) ??
        throwFunction(`No workflow for key ${JSON.stringify(workflowKey)}`)()
    )
  )
}
