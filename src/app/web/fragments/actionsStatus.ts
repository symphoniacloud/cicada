import { AppState } from '../../environment/AppState.js'
import { Route } from '../../internalHttpRouter/internalHttpRoute.js'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes.js'
import { isFailure, isSuccess } from '../../util/structuredResult.js'
import { invalidRequestResponse, notFoundHTMLResponse } from '../htmlResponses.js'
import { createWorkflowRunEventTableResponse } from './views/activityAndStatusView.js'
import { parsePartialRepoCoordinates } from './requestParsing/parsePartialRepoCoordinates.js'
import {
  getLatestWorkflowRunEventsForAccountForUser,
  getLatestWorkflowRunEventsForRepoForUser,
  getLatestWorkflowRunEventsForUserWithUserSettings
} from '../../domain/user/userVisible.js'
import { GithubRepoKey } from '../../domain/types/GithubKeys.js'
import { fragmentPath } from '../routingCommon.js'
import { GithubAccountId } from '../../domain/types/GithubAccountId.js'
import { UserScopeReferenceData } from '../../domain/types/UserScopeReferenceData.js'

export const actionsStatusFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('actionsStatus'),
  target: actionsStatus
}

export async function actionsStatus(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const coordinatesResult = parsePartialRepoCoordinates(event)

  if (isFailure(coordinatesResult)) return coordinatesResult.failureResult
  const { accountId, repoId } = coordinatesResult.result

  if (accountId && repoId) return await actionsStatusForRepo(appState, event.refData, { accountId, repoId })
  if (accountId) return await actionsStatusForAccount(appState, event.refData, accountId)
  if (!accountId && !repoId) return await actionsStatusForDashboard(appState, event.refData)
  return invalidRequestResponse
}

async function actionsStatusForDashboard(appState: AppState, refData: UserScopeReferenceData) {
  const latestEvents = await getLatestWorkflowRunEventsForUserWithUserSettings(appState, refData)
  return createWorkflowRunEventTableResponse('homeStatus', appState.clock, latestEvents)
}

async function actionsStatusForAccount(
  appState: AppState,
  refData: UserScopeReferenceData,
  accountId: GithubAccountId
) {
  const latestEventsResult = await getLatestWorkflowRunEventsForAccountForUser(appState, refData, accountId)
  if (!isSuccess(latestEventsResult)) return notFoundHTMLResponse
  return createWorkflowRunEventTableResponse('accountStatus', appState.clock, latestEventsResult.result)
}

async function actionsStatusForRepo(
  appState: AppState,
  refData: UserScopeReferenceData,
  repoKey: GithubRepoKey
) {
  const latestEventsResult = await getLatestWorkflowRunEventsForRepoForUser(appState, refData, repoKey)
  if (!isSuccess(latestEventsResult)) return notFoundHTMLResponse
  return createWorkflowRunEventTableResponse('repoStatus', appState.clock, latestEventsResult.result)
}
