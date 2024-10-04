import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { isFailure, isSuccess } from '../../util/structuredResult'
import { getWorkflowCoordinates } from './requestParsing/getWorkflowCoordinates'
import { createWorkflowHeadingResponse } from './views/workflowHeadingView'
import { fragmentPath } from '../routingCommon'
import { getAvailableRunEventsForWorkflowForUser } from '../../domain/user/userVisible'
import { notFoundHTMLResponse } from '../htmlResponses'
import { loadUserScopeReferenceData } from '../../domain/github/userScopeReferenceData'

export const workflowHeadingFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('workflow/heading'),
  target: workflowHeading
}

export async function workflowHeading(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const parsed = getWorkflowCoordinates(event)
  if (isFailure(parsed)) return parsed.failureResult

  // TODO - consider putting this on event / appState
  const refData = await loadUserScopeReferenceData(appState, event.userId)

  const result = await getAvailableRunEventsForWorkflowForUser(appState, refData, parsed.result, 1)
  if (!isSuccess(result)) return notFoundHTMLResponse
  return createWorkflowHeadingResponse(result.result.items[0])
}
