import { AppState } from '../../environment/AppState.js'
import { Route } from '../../internalHttpRouter/internalHttpRoute.js'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes.js'
import { isFailure, isSuccess } from '../../util/structuredResult.js'
import { invalidRequestResponse, notFoundHTMLResponse } from '../htmlResponses.js'
import {
  createGithubActivityResponse,
  createGithubPushTableResponse,
  createWorkflowRunEventTableResponse
} from './views/activityAndStatusView.js'
import { parsePartialWorkflowKeyFromQueryString } from './requestParsing/parseFragmentQueryStrings.js'
import {
  getAllRunEventsForWorkflowForUser,
  getRecentActiveBranchesForUserAndAccount,
  getRecentActiveBranchesForUserWithUserSettings,
  getRecentActivityForRepoForUser
} from '../../domain/user/userVisible.js'
import { fragmentPath } from '../routingCommon.js'
import { UserScopeReferenceData } from '../../domain/types/UserScopeReferenceData.js'
import { GitHubAccountId, GitHubRepoKey, GitHubWorkflowKey } from '../../types/GitHubTypes.js'

export const gitHubActivityFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('gitHubActivity'),
  target: gitHubActivity
}

export async function gitHubActivity(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const coordinatesResult = parsePartialWorkflowKeyFromQueryString(event)

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
  accountId: GitHubAccountId
) {
  const pushesResult = await getRecentActiveBranchesForUserAndAccount(appState, refData, accountId)
  if (!isSuccess(pushesResult)) return notFoundHTMLResponse
  return createGithubPushTableResponse('accountActivity', appState.clock, pushesResult.result)
}

async function githubActivityForRepo(
  appState: AppState,
  refData: UserScopeReferenceData,
  repoKey: GitHubRepoKey
) {
  const activityResult = await getRecentActivityForRepoForUser(appState, refData, repoKey)
  if (!isSuccess(activityResult)) return notFoundHTMLResponse
  return createGithubActivityResponse('repoActivity', appState.clock, activityResult.result)
}

async function githubActivityForWorkflow(
  appState: AppState,
  refData: UserScopeReferenceData,
  workflow: GitHubWorkflowKey
) {
  const runEventsResult = await getAllRunEventsForWorkflowForUser(appState, refData, workflow)
  if (!isSuccess(runEventsResult)) return notFoundHTMLResponse
  return createWorkflowRunEventTableResponse('workflowActivity', appState.clock, runEventsResult.result)
}
