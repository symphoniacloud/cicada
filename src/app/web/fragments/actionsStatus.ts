import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { isFailure, isSuccess } from '../../util/structuredResult'
import { invalidRequestResponse, notFoundHTMLResponse } from '../htmlResponses'
import { createWorkflowRunEventTableResponse } from './views/activityAndStatusView'
import { getOptionalRepoCoordinates } from './requestParsing/getOptionalRepoCoordinates'
import {
  getLatestWorkflowRunEventsForAccountForUser,
  getLatestWorkflowRunEventsForRepoForUser,
  getLatestWorkflowRunEventsForUserWithUserSettings
} from '../../domain/user/userVisible'
import { GithubRepoKey } from '../../domain/types/GithubKeys'
import { fragmentPath } from '../routingCommon'
import { GithubAccountId } from '../../domain/types/GithubAccountId'
import { loadUserScopeReferenceData } from '../../domain/github/userScopeReferenceData'
import { UserScopeReferenceData } from '../../domain/types/UserScopeReferenceData'

export const actionsStatusFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('actionsStatus'),
  target: actionsStatus
}

export async function actionsStatus(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const coordinatesResult = getOptionalRepoCoordinates(event)

  if (isFailure(coordinatesResult)) return coordinatesResult.failureResult
  const { accountId, repoId } = coordinatesResult.result
  // TODO - consider putting this on event / appState
  const refData = await loadUserScopeReferenceData(appState, event.userId)

  if (accountId && repoId) return await actionsStatusForRepo(appState, refData, { accountId, repoId })
  if (accountId) return await actionsStatusForAccount(appState, refData, accountId)
  if (!accountId && !repoId) return await actionsStatusForDashboard(appState, refData)
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
