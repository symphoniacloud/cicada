import { AppState } from '../../environment/AppState.js'
import { Route } from '../../internalHttpRouter/internalHttpRoute.js'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes.js'
import { isFailure, isSuccess } from '../../util/structuredResult.js'
import { parseWorkflowCoordinates } from './requestParsing/parseWorkflowCoordinates.js'
import { createWorkflowHeadingResponse } from './views/workflowHeadingView.js'
import { fragmentPath } from '../routingCommon.js'
import { getAvailableRunEventsForWorkflowForUser } from '../../domain/user/userVisible.js'
import { notFoundHTMLResponse } from '../htmlResponses.js'

export const workflowHeadingFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('workflow/heading'),
  target: workflowHeading
}

export async function workflowHeading(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const parsed = parseWorkflowCoordinates(event)
  if (isFailure(parsed)) return parsed.failureResult

  const result = await getAvailableRunEventsForWorkflowForUser(appState, event.refData, parsed.result, 1)
  if (!isSuccess(result)) return notFoundHTMLResponse
  return createWorkflowHeadingResponse(result.result.items[0])
}
