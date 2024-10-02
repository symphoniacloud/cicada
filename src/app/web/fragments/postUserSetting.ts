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
import { getWorkflowsForUser } from '../../domain/user/userVisible'
import { calculateAccountSettings, calculateUserSettings } from '../../domain/user/calculatedUserSettings'
import { UserSetting } from '../../domain/types/UserSettings'
import { fragmentPath } from '../routingCommon'
import { getRepositoriesForAccount } from '../../domain/github/githubRepo'
import { getRepository } from '../../domain/entityStore/entities/GithubRepositoryEntity'
import { latestWorkflowRunEventForWorkflow } from '../../domain/entityStore/entities/GithubLatestWorkflowRunEventEntity'
import { GithubAccountId } from '../../domain/types/GithubAccountId'
import { GithubUserId } from '../../domain/types/GithubUserId'

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
      { accountId: accountId, repoId, workflowId },
      setting,
      enabled
    )
  }
  if (repoId) {
    return processUpdateRepoSetting(
      appState,
      event.userId,
      { accountId: accountId, repoId },
      setting,
      enabled
    )
  }

  return processUpdateAccountSetting(appState, event.userId, accountId, setting, enabled)
}

async function processUpdateAccountSetting(
  appState: AppState,
  userId: GithubUserId,
  accountId: GithubAccountId,
  setting: UserSetting,
  enabled: boolean
) {
  logger.debug('processUpdateAccountSetting')
  const accountRepos = await getRepositoriesForAccount(appState, accountId)
  const accountWorkflows = await getWorkflowsForUser(appState, userId)
  const updatedSettings = await updateAndSaveAccountSetting(appState, userId, accountId, setting, enabled)
  const updatedAccountSettings =
    updatedSettings.github.accounts[accountId] ??
    throwFunction('Internal error in processUpdateAccountSetting - no account settings')()

  return createUpdateUserAccountSettingResponse(
    accountId,
    toDisplayableAccountSettings(
      accountId,
      calculateAccountSettings(updatedAccountSettings, accountId, accountRepos, accountWorkflows),
      accountRepos,
      accountWorkflows
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
    newCalculatedUserSettings.github.accounts[repoKey.accountId]?.repos[repoKey.repoId] ??
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
  const workflow =
    (await latestWorkflowRunEventForWorkflow(appState.entityStore, workflowKey)) ??
    throwFunction(`No workflow data for key ${JSON.stringify(workflowKey)}`)()

  const allWorkflows = [workflow]
  const newCalculatedUserSettings = calculateUserSettings(newPersistedUserSettings, [workflowKey], [workflow])
  const newCalculatedWorkflowSettings =
    newCalculatedUserSettings.github.accounts[workflowKey.accountId]?.repos[workflowKey.repoId]?.workflows[
      workflowKey.workflowId
    ] ?? throwFunction('Internal error in processUpdateWorkflowSetting - no workflow settings')()

  // TODO - think about validating values of IDs

  return createUpdateUserWorkflowSettingResponse(
    workflowKey,
    toDisplayableWorkflowSettings(workflowKey, newCalculatedWorkflowSettings, allWorkflows)
  )
}
