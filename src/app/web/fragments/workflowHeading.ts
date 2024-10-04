import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { isFailure } from '../../util/structuredResult'
import { getWorkflowCoordinates } from './requestParsing/getWorkflowCoordinates'
import { createWorkflowHeadingResponse } from './views/workflowHeadingView'
import { fragmentPath } from '../routingCommon'
import { getRunEventsForWorkflowPage } from '../../domain/entityStore/entities/GithubWorkflowRunEventEntity'

export const workflowHeadingFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('workflow/heading'),
  target: workflowHeading
}

export async function workflowHeading(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const parsed = getWorkflowCoordinates(event)
  if (isFailure(parsed)) return parsed.failureResult

  // TODO eventually - make sure user has permission for this
  const run = (await getRunEventsForWorkflowPage(appState.entityStore, parsed.result, 1)).items[0]
  return createWorkflowHeadingResponse(run)
}
