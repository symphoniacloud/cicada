import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { isFailure, isSuccess } from '../../util/structuredResult'
import { invalidRequestResponse, notFoundHTMLResponse } from '../htmlResponses'
import {
  createGithubActivityResponse,
  createGithubPushTableResponse,
  createWorkflowRunEventTableResponse
} from './views/activityAndStatusView'
import { getOptionalWorkflowCoordinates } from './requestParsing/getOptionalWorkflowCoordinates'
import { GithubRepoKey, GithubWorkflowKey } from '../../domain/types/GithubKeys'
import {
  getRecentActiveBranchesForUserAndAccount,
  getRecentActiveBranchesForUserWithUserSettings,
  getRecentActivityForRepoForUser,
  getAllRunEventsForWorkflowForUser
} from '../../domain/user/userVisible'
import { fragmentPath } from '../routingCommon'
import { GithubAccountId } from '../../domain/types/GithubAccountId'
import { loadUserScopeReferenceData } from '../../domain/github/userScopeReferenceData'
import { UserScopeReferenceData } from '../../domain/types/UserScopeReferenceData'

export const gitHubActivityFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('gitHubActivity'),
  target: gitHubActivity
}

export async function gitHubActivity(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const coordinatesResult = getOptionalWorkflowCoordinates(event)

  if (isFailure(coordinatesResult)) return coordinatesResult.failureResult
  const { accountId, repoId, workflowId } = coordinatesResult.result
  const { userId } = event

  // TODO - consider putting this on event / appState
  const refData = await loadUserScopeReferenceData(appState, userId)

  if (accountId) {
    if (repoId) {
      if (workflowId) {
        return await githubActivityForWorkflow(appState, refData, { accountId, repoId, workflowId })
      } else {
        return await githubActivityForRepo(appState, refData, { accountId, repoId })
      }
    } else {
      return await githubActivityForAccount(appState, refData, accountId)
    }
  }
  if (!accountId && !repoId && !workflowId) return await githubActivityForDashboard(appState, refData)
  return invalidRequestResponse
}

async function githubActivityForDashboard(appState: AppState, refData: UserScopeReferenceData) {
  const pushes = await getRecentActiveBranchesForUserWithUserSettings(appState, refData)
  return createGithubPushTableResponse('homeActivity', appState.clock, pushes)
}

async function githubActivityForAccount(
  appState: AppState,
  refData: UserScopeReferenceData,
  accountId: GithubAccountId
) {
  const pushesResult = await getRecentActiveBranchesForUserAndAccount(appState, refData, accountId)
  if (!isSuccess(pushesResult)) return notFoundHTMLResponse
  return createGithubPushTableResponse('accountActivity', appState.clock, pushesResult.result)
}

async function githubActivityForRepo(
  appState: AppState,
  refData: UserScopeReferenceData,
  repoKey: GithubRepoKey
) {
  const activityResult = await getRecentActivityForRepoForUser(appState, refData, repoKey)
  if (!isSuccess(activityResult)) return notFoundHTMLResponse
  return createGithubActivityResponse('repoActivity', appState.clock, activityResult.result)
}

async function githubActivityForWorkflow(
  appState: AppState,
  refData: UserScopeReferenceData,
  workflow: GithubWorkflowKey
) {
  const runEventsResult = await getAllRunEventsForWorkflowForUser(appState, refData, workflow)
  if (!isSuccess(runEventsResult)) return notFoundHTMLResponse
  return createWorkflowRunEventTableResponse('workflowActivity', appState.clock, runEventsResult.result)
}
