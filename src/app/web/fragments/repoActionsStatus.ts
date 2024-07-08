import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { isFailure } from '../../util/structuredResult'
import { getRepository } from '../../domain/github/githubRepository'
import { latestWorkflowRunEventsPerWorkflowForRepo } from '../../domain/github/githubLatestWorkflowRunEvents'
import { notFoundHTMLResponse } from '../htmlResponses'
import { getRepoCoordinates } from './requestProcessing/getRepoCoordinates'
import { createWorkflowRunEventTableResponse } from './views/activityAndStatusView'

export const repoActionsStatusRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: '/app/fragment/actionsStatus',
  target: repoActionsStatus
}

export async function repoActionsStatus(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const repoCoordinatesResult = getRepoCoordinates(event)

  if (isFailure(repoCoordinatesResult)) return repoCoordinatesResult.failureResult
  const { ownerId, repoId } = repoCoordinatesResult.result

  if (!(await getRepository(appState, ownerId, repoId))) return notFoundHTMLResponse

  // TODO eventually - make sure user has permission for this
  // TODO eventually - move repo check into domain logic
  return createWorkflowRunEventTableResponse(
    'repoStatus',
    appState.clock,
    await latestWorkflowRunEventsPerWorkflowForRepo(appState, ownerId, repoId)
  )
}
