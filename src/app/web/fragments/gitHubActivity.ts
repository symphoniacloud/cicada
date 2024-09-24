import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { isFailure } from '../../util/structuredResult'
import { getRepository } from '../../domain/github/githubRepository'
import { invalidRequestResponse, notFoundHTMLResponse } from '../htmlResponses'
import {
  createGithubActivityResponse,
  createGithubPushTableResponse,
  createWorkflowRunEventTableResponse
} from './views/activityAndStatusView'
import { getOptionalWorkflowCoordinates } from './requestParsing/getOptionalWorkflowCoordinates'
import { logger } from '../../util/logging'
import {
  GithubAccountId,
  GithubRepoKey,
  GithubUserId,
  GithubWorkflowKey
} from '../../domain/types/GithubKeys'
import {
  getRecentActiveBranchesForUser,
  getRecentActiveBranchesForUserAndAccount,
  getRecentActivityForRepoForUser,
  getRunEventsForWorkflowForUser
} from '../../domain/user/userVisible'
import { fragmentPath } from '../routingCommon'
import { getAccountForUser } from '../../domain/github/githubAccount'

export const gitHubActivityFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('gitHubActivity'),
  target: gitHubActivity
}

export async function gitHubActivity(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const coordinatesResult = getOptionalWorkflowCoordinates(event)

  if (isFailure(coordinatesResult)) return coordinatesResult.failureResult
  const { ownerId, repoId, workflowId } = coordinatesResult.result
  const { userId } = event

  if (ownerId) {
    if (repoId) {
      if (workflowId) {
        return await githubActivityForWorkflow(appState, userId, { ownerId, repoId, workflowId })
      } else {
        return await githubActivityForRepo(appState, userId, { ownerId, repoId })
      }
    } else {
      return await githubActivityForAccount(appState, userId, ownerId)
    }
  }
  if (!ownerId && !repoId && !workflowId) return await githubActivityForHome(appState, userId)
  return invalidRequestResponse
}

async function githubActivityForWorkflow(
  appState: AppState,
  userId: GithubUserId,
  workflow: GithubWorkflowKey
) {
  logger.debug('githubActivityForWorkflow', { workflow })
  // TODO - check workflow exists

  return createWorkflowRunEventTableResponse(
    'workflowActivity',
    appState.clock,
    await getRunEventsForWorkflowForUser(appState, userId, workflow)
  )
}

async function githubActivityForRepo(appState: AppState, userId: GithubUserId, repoKey: GithubRepoKey) {
  logger.debug('githubActivityForRepo')
  if (!(await getRepository(appState, repoKey))) return notFoundHTMLResponse

  return createGithubActivityResponse(
    'repoActivity',
    appState.clock,
    await getRecentActivityForRepoForUser(appState, userId, repoKey)
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
    await getRecentActiveBranchesForUserAndAccount(appState, userId, accountId)
  )
}

async function githubActivityForHome(appState: AppState, userId: GithubUserId) {
  logger.debug('githubActivityForHome')
  return createGithubPushTableResponse(
    'homeActivity',
    appState.clock,
    await getRecentActiveBranchesForUser(appState, userId)
  )
}
