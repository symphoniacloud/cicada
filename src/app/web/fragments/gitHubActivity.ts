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
import { GithubRepoKey, GithubUserId, GithubWorkflowKey } from '../../domain/types/GithubKeys'
import {
  getRecentActiveBranchesForUser,
  getRecentActivityForRepoForUser,
  getRunEventsForWorkflowForUser
} from '../../domain/user/userVisible'
import { fragmentPath } from '../routingCommon'

export const gitHubActivityFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('gitHubActivity'),
  target: gitHubActivity
}

export async function gitHubActivity(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const coordinatesResult = getOptionalWorkflowCoordinates(event)

  if (isFailure(coordinatesResult)) return coordinatesResult.failureResult
  const { ownerId, repoId, workflowId } = coordinatesResult.result
  const { userId } = event

  if (ownerId && repoId) {
    return workflowId
      ? await githubActivityForWorkflow(appState, userId, { ownerId, repoId, workflowId })
      : await githubActivityForRepo(appState, userId, { ownerId, repoId })
  }
  if (!ownerId && !repoId) return await githubActivityForHome(appState, userId)
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

async function githubActivityForHome(appState: AppState, userId: GithubUserId) {
  logger.debug('githubActivityForHome')
  return createGithubPushTableResponse(
    'homeActivity',
    appState.clock,
    await getRecentActiveBranchesForUser(appState, userId)
  )
}
