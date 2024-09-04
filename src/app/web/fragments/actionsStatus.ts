import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { isFailure } from '../../util/structuredResult'
import { getRepository } from '../../domain/github/githubRepository'
import { invalidRequestResponse, notFoundHTMLResponse } from '../htmlResponses'
import { createWorkflowRunEventTableResponse } from './views/activityAndStatusView'
import { getOptionalRepoCoordinates } from './requestParsing/getOptionalRepoCoordinates'
import {
  getLatestVisibleWorkflowRunEventsForUser,
  getLatestVisibleWorkflowRunEventsPerWorkflowForRepoForUser
} from '../../domain/user/userVisible'
import { GithubRepoKey } from '../../domain/types/GithubKeys'

export const actionsStatusRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: '/app/fragment/actionsStatus',
  target: actionsStatus
}

export async function actionsStatus(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const coordinatesResult = getOptionalRepoCoordinates(event)

  if (isFailure(coordinatesResult)) return coordinatesResult.failureResult
  const { ownerId, repoId } = coordinatesResult.result

  if (ownerId && repoId) return await actionsStatusForRepo(appState, event.userId, { ownerId, repoId })
  if (!ownerId && !repoId) return actionsStatusForHome(appState, event.userId)
  return invalidRequestResponse
}

async function actionsStatusForRepo(appState: AppState, userId: number, repoKey: GithubRepoKey) {
  // TODO eventually - make sure user has permission for this
  // TODO eventually - move repo check into domain logic
  if (!(await getRepository(appState, repoKey))) return notFoundHTMLResponse

  const latestEvents = await getLatestVisibleWorkflowRunEventsPerWorkflowForRepoForUser(
    appState,
    userId,
    repoKey
  )
  return createWorkflowRunEventTableResponse(
    'repoStatus',
    appState.clock,
    latestEvents.visibleEvents,
    latestEvents.someEventsHidden
  )
}

async function actionsStatusForHome(appState: AppState, userId: number) {
  const latestEvents = await getLatestVisibleWorkflowRunEventsForUser(appState, userId)
  return createWorkflowRunEventTableResponse(
    'homeStatus',
    appState.clock,
    latestEvents.visibleEvents,
    latestEvents.someEventsHidden
  )
}
