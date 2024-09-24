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
import {
  GithubAccountId,
  GithubRepoKey,
  GithubUserId,
  GithubWorkflowKey
} from '../../domain/types/GithubKeys'
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
import { getWorkflowsForUser } from '../../domain/user/userVisible'
import { calculateAccountSettings, calculateUserSettings } from '../../domain/user/calculatedUserSettings'
import { UserSetting } from '../../domain/types/UserSettings'
import { fragmentPath } from '../routingCommon'
import { getRepositoriesForAccount, repositorySummaryToKey } from '../../domain/github/githubRepository'
import { getRepository } from '../../domain/entityStore/entities/GithubRepositoryEntity'

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
      event.userId,
      { ownerId: accountId, repoId, workflowId },
      setting,
      enabled
    )
  }
  if (repoId) {
    return processUpdateRepoSetting(appState, event.userId, { ownerId: accountId, repoId }, setting, enabled)
  }

  return processUpdateAccountSetting(appState, event.userId, accountId, setting, enabled)
}

async function processUpdateAccountSetting(
  appState: AppState,
  userId: GithubUserId,
  ownerId: GithubAccountId,
  setting: UserSetting,
  enabled: boolean
) {
  logger.debug('processUpdateAccountSetting')
  const allRepos = await getRepositoriesForAccount(appState, ownerId)
  // TODO - only need workflows for account
  const allWorkflows = await getWorkflowsForUser(appState, userId)
  const updatedSettings = await updateAndSaveAccountSetting(appState, userId, ownerId, setting, enabled)
  const updatedAccountSettings =
    updatedSettings.github.accounts[ownerId] ??
    throwFunction('Internal error in processUpdateAccountSetting - no account settings')()

  return createUpdateUserAccountSettingResponse(
    ownerId,
    toDisplayableAccountSettings(
      ownerId,
      calculateAccountSettings(
        updatedAccountSettings,
        ownerId,
        allRepos.map(repositorySummaryToKey),
        allWorkflows
      ),
      allRepos,
      allWorkflows
    )
  )
}

async function processUpdateRepoSetting(
  appState: AppState,
  userId: GithubUserId,
  repoKey: GithubRepoKey,
  setting: UserSetting,
  enabled: boolean
) {
  logger.debug('processUpdateRepoSetting')
  await updateAndSaveRepoSetting(appState, userId, repoKey, setting, enabled)

  const newPersistedUserSettings = await getUserSettings(appState, userId)
  const repoSummary =
    (await getRepository(appState.entityStore, repoKey)) ??
    throwFunction(`Unable to find repo for key ${JSON.stringify(repoKey)}`)()
  const allWorkflows = await getWorkflowsForUser(appState, userId)
  const newCalculatedUserSettings = calculateUserSettings(newPersistedUserSettings, [repoKey], allWorkflows)
  const newCalculatedRepoSettings =
    newCalculatedUserSettings.github.accounts[repoKey.ownerId]?.repos[repoKey.repoId] ??
    throwFunction('Internal error in processUpdateRepoSetting - no repo settings')()

  return createUpdateUserRepoSettingResponse(
    repoKey,
    toDisplayableRepoSettings(repoKey, newCalculatedRepoSettings, [repoSummary], allWorkflows)
  )
}

async function processUpdateWorkflowSetting(
  appState: AppState,
  userId: GithubUserId,
  workflowKey: GithubWorkflowKey,
  setting: UserSetting,
  enabled: boolean
) {
  logger.debug('processUpdateWorkflowSetting')
  await updateAndSaveWorkflowSetting(appState, userId, workflowKey, setting, enabled)

  const newPersistedUserSettings = await getUserSettings(appState, userId)
  // TODO - we can just get the workflow referenced by the key
  const allWorkflows = await getWorkflowsForUser(appState, userId)
  const newCalculatedUserSettings = calculateUserSettings(
    newPersistedUserSettings,
    [workflowKey],
    allWorkflows
  )
  const newCalculatedWorkflowSettings =
    newCalculatedUserSettings.github.accounts[workflowKey.ownerId]?.repos[workflowKey.repoId]?.workflows[
      workflowKey.workflowId
    ] ?? throwFunction('Internal error in processUpdateWorkflowSetting - no workflow settings')()

  // TODO - think about validating values of IDs

  return createUpdateUserWorkflowSettingResponse(
    workflowKey,
    toDisplayableWorkflowSettings(workflowKey, newCalculatedWorkflowSettings, allWorkflows)
  )
}
