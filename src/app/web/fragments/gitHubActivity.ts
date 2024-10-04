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
  getAllRunEventsForWorkflowForUser,
  getRecentActiveBranchesForUserAndAccount,
  getRecentActiveBranchesForUserWithUserSettings,
  getRecentActivityForRepoForUser
} from '../../domain/user/userVisible'
import { fragmentPath } from '../routingCommon'
import { GithubAccountId } from '../../domain/types/GithubAccountId'
import { UserScopeReferenceData } from '../../domain/types/UserScopeReferenceData'

export const gitHubActivityFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('gitHubActivity'),
  target: gitHubActivity
}

export async function gitHubActivity(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const coordinatesResult = getOptionalWorkflowCoordinates(event)

  if (isFailure(coordinatesResult)) return coordinatesResult.failureResult
  const { accountId, repoId, workflowId } = coordinatesResult.result

  if (accountId) {
    if (repoId) {
      if (workflowId) {
        return await githubActivityForWorkflow(appState, event.refData, { accountId, repoId, workflowId })
      } else {
        return await githubActivityForRepo(appState, event.refData, { accountId, repoId })
      }
    } else {
      return await githubActivityForAccount(appState, event.refData, accountId)
    }
  }
  if (!accountId && !repoId && !workflowId) return await githubActivityForDashboard(appState, event.refData)
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
