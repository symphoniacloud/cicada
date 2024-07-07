import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { isFailure } from '../../util/structuredResult'
import { getWorkflowCoordinates } from './requestProcessing/getWorkflowCoordinates'
import { getRunEventsForWorkflow } from '../../domain/github/githubWorkflowRunEvent'
import { createWorkflowActivityResponse } from './views/workflowActivityView'

export const workflowActivityRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: '/app/fragment/workflow/activity',
  target: workflowActivity
}

export async function workflowActivity(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const workflowCoordinatesResult = getWorkflowCoordinates(event)

  if (isFailure(workflowCoordinatesResult)) return workflowCoordinatesResult.failureResult
  const { ownerId, repoId, workflowId } = workflowCoordinatesResult.result

  const runEvents = await getRunEventsForWorkflow(appState, ownerId, repoId, workflowId)

  // TODO eventually - make sure user has permission for this
  return createWorkflowActivityResponse(appState.clock, runEvents)
}
