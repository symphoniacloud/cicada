import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { isFailure } from '../../util/structuredResult'
import { invalidRequestResponse, notFoundHTMLResponse } from '../htmlResponses'
import {
  createGithubActivityResponse,
  createGithubPushTableResponse,
  createWorkflowRunEventTableResponse
} from './views/activityAndStatusView'
import { getOptionalWorkflowCoordinates } from './requestParsing/getOptionalWorkflowCoordinates'
import { logger } from '../../util/logging'
import { GithubRepoKey, GithubWorkflowKey } from '../../domain/types/GithubKeys'
import {
  getRecentActiveBranchesForUserAndAccount,
  getRecentActiveBranchesForUserWithUserSettings,
  getRecentActivityForRepoForUser,
  getRunEventsForWorkflowForUser
} from '../../domain/user/userVisible'
import { fragmentPath } from '../routingCommon'
import { getAccountForUser } from '../../domain/github/githubAccount'
import { getRepository } from '../../domain/entityStore/entities/GithubRepositoryEntity'
import { GithubAccountId } from '../../domain/types/GithubAccountId'
import { GithubUserId } from '../../domain/types/GithubUserId'

export const gitHubActivityFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('gitHubActivity'),
  target: gitHubActivity
}

export async function gitHubActivity(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const coordinatesResult = getOptionalWorkflowCoordinates(event)

  if (isFailure(coordinatesResult)) return coordinatesResult.failureResult
  const { accountId, repoId, workflowId } = coordinatesResult.result
  const { userId } = event

  if (accountId) {
    if (repoId) {
      if (workflowId) {
        return await githubActivityForWorkflow(appState, { accountId, repoId, workflowId })
      } else {
        return await githubActivityForRepo(appState, { accountId, repoId })
      }
    } else {
      return await githubActivityForAccount(appState, userId, accountId)
    }
  }
  if (!accountId && !repoId && !workflowId) return await githubActivityForDashboard(appState, userId)
  return invalidRequestResponse
}

async function githubActivityForDashboard(appState: AppState, userId: GithubUserId) {
  logger.debug('githubActivityForDashboard')
  return createGithubPushTableResponse(
    'homeActivity',
    appState.clock,
    await getRecentActiveBranchesForUserWithUserSettings(appState, userId)
  )
}

async function githubActivityForAccount(
  appState: AppState,
  userId: GithubUserId,
  accountId: GithubAccountId
) {
  logger.debug('githubActivityForAccount')
  if (!(await getAccountForUser(appState, userId, accountId))) return notFoundHTMLResponse

  return createGithubPushTableResponse(
    'accountActivity',
    appState.clock,
    await getRecentActiveBranchesForUserAndAccount(appState, accountId)
  )
}

async function githubActivityForRepo(appState: AppState, repoKey: GithubRepoKey) {
  logger.debug('githubActivityForRepo')
  if (!(await getRepository(appState.entityStore, repoKey))) return notFoundHTMLResponse

  return createGithubActivityResponse(
    'repoActivity',
    appState.clock,
    await getRecentActivityForRepoForUser(appState, repoKey)
  )
}

async function githubActivityForWorkflow(appState: AppState, workflow: GithubWorkflowKey) {
  logger.debug('githubActivityForWorkflow', { workflow })
  // TODO - check workflow exists

  return createWorkflowRunEventTableResponse(
    'workflowActivity',
    appState.clock,
    await getRunEventsForWorkflowForUser(appState, workflow)
  )
}
