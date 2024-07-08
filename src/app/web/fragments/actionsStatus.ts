import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { isFailure } from '../../util/structuredResult'
import { getRepository } from '../../domain/github/githubRepository'
import {
  latestWorkflowRunEventsPerWorkflowForOwners,
  latestWorkflowRunEventsPerWorkflowForRepo
} from '../../domain/github/githubLatestWorkflowRunEvents'
import { invalidRequestResponse, notFoundHTMLResponse } from '../htmlResponses'
import { createWorkflowRunEventTableResponse } from './views/activityAndStatusView'
import { getAllAccountIdsForUser } from '../../domain/github/githubMembership'
import { getOptionalRepoCoordinates } from './requestParsing/getOptionalRepoCoordinates'

export const actionsStatusRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: '/app/fragment/actionsStatus',
  target: actionsStatus
}

export async function actionsStatus(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const coordinatesResult = getOptionalRepoCoordinates(event)

  if (isFailure(coordinatesResult)) return coordinatesResult.failureResult
  const { ownerId, repoId } = coordinatesResult.result

  if (ownerId && repoId) return await actionsStatusForRepo(appState, ownerId, repoId)
  if (!ownerId && !repoId) return actionsStatusForHome(appState, event.userId)
  return invalidRequestResponse
}

async function actionsStatusForRepo(appState: AppState, ownerId: number, repoId: number) {
  // TODO eventually - make sure user has permission for this
  // TODO eventually - move repo check into domain logic
  if (!(await getRepository(appState, ownerId, repoId))) return notFoundHTMLResponse

  return createWorkflowRunEventTableResponse(
    'repoStatus',
    appState.clock,
    await latestWorkflowRunEventsPerWorkflowForRepo(appState, ownerId, repoId)
  )
}

async function actionsStatusForHome(appState: AppState, userId: number) {
  const accountIds = await getAllAccountIdsForUser(appState, userId)
  return createWorkflowRunEventTableResponse(
    'homeStatus',
    appState.clock,
    await latestWorkflowRunEventsPerWorkflowForOwners(appState, accountIds)
  )
}
