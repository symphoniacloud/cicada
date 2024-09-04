import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { isFailure } from '../../util/structuredResult'
import { getRepository } from '../../domain/github/githubRepository'
import { getRecentActivityForRepo } from '../../domain/github/githubActivity'
import { invalidRequestResponse, notFoundHTMLResponse } from '../htmlResponses'
import {
  createGithubActivityResponse,
  createGithubPushTableResponse,
  createWorkflowRunEventTableResponse
} from './views/activityAndStatusView'
import { getOptionalWorkflowCoordinates } from './requestParsing/getOptionalWorkflowCoordinates'
import { getRunEventsForWorkflow } from '../../domain/github/githubWorkflowRunEvent'
import { recentActiveBranchesForOwners } from '../../domain/github/githubLatestPushesPerRef'
import { getAllAccountIdsForUser } from '../../domain/github/githubMembership'
import { logger } from '../../util/logging'
import { GithubRepoKey } from '../../domain/types/GithubKeys'

export const gitHubActivityRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: '/app/fragment/gitHubActivity',
  target: gitHubActivity
}

export async function gitHubActivity(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const coordinatesResult = getOptionalWorkflowCoordinates(event)

  if (isFailure(coordinatesResult)) return coordinatesResult.failureResult
  const { ownerId, repoId, workflowId } = coordinatesResult.result

  if (ownerId && repoId) {
    return workflowId
      ? await githubActivityForWorkflow(appState, ownerId, repoId, workflowId)
      : await githubActivityForRepo(appState, { ownerId, repoId })
  }
  if (!ownerId && !repoId) return await githubActivityForHome(appState, event.userId)
  return invalidRequestResponse
}

async function githubActivityForWorkflow(
  appState: AppState,
  ownerId: number,
  repoId: number,
  workflowId: number
) {
  logger.debug('githubActivityForWorkflow', { ownerId, repoId, workflowId })
  // TODO eventually - make sure user has permission for this
  return createWorkflowRunEventTableResponse(
    'workflowActivity',
    appState.clock,
    await getRunEventsForWorkflow(appState, ownerId, repoId, workflowId)
  )
}

async function githubActivityForRepo(appState: AppState, repoKey: GithubRepoKey) {
  logger.debug('githubActivityForRepo')
  if (!(await getRepository(appState, repoKey))) return notFoundHTMLResponse

  // TODO eventually - make sure user has permission for this
  // TODO eventually - move repo check into domain logic
  return createGithubActivityResponse(
    'repoActivity',
    appState.clock,
    await getRecentActivityForRepo(appState, repoKey)
  )
}

async function githubActivityForHome(appState: AppState, userId: number) {
  logger.debug('githubActivityForHome')
  return createGithubPushTableResponse(
    'homeActivity',
    appState.clock,
    await recentActiveBranchesForOwners(appState, await getAllAccountIdsForUser(appState, userId))
  )
}
