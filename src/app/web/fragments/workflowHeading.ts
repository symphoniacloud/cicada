import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { isFailure } from '../../util/structuredResult'
import { getWorkflowCoordinates } from './requestParsing/getWorkflowCoordinates'
import { createWorkflowHeadingResponse } from './views/workflowHeadingView'
import { getRunEventsForWorkflowPage } from '../../domain/github/githubWorkflowRunEvent'
import { fragmentPath } from '../routingCommon'

export const workflowHeadingFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('workflow/heading'),
  target: workflowHeading
}

export async function workflowHeading(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const workflowCoordinatesResult = getWorkflowCoordinates(event)

  if (isFailure(workflowCoordinatesResult)) return workflowCoordinatesResult.failureResult
  const { accountId, repoId, workflowId } = workflowCoordinatesResult.result

  const result = await getRunEventsForWorkflowPage(appState, accountId, repoId, workflowId, 1)
  const run = result.items.length > 0 ? result.items[0] : undefined

  // TODO eventually - make sure user has permission for this
  return createWorkflowHeadingResponse(run)
}
