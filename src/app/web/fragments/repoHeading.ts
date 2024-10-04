import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { isFailure } from '../../util/structuredResult'
import { createRepoHeadingResponse } from './views/repoHeadingView'
import { notFoundHTMLResponse } from '../htmlResponses'
import { getRepoCoordinates } from './requestParsing/getRepoCoordinates'
import { fragmentPath } from '../routingCommon'
import { getRepoStructure, loadUserScopeReferenceData } from '../../domain/github/userScopeReferenceData'

export const repoHeadingFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('repo/heading'),
  target: repoHeading
}

export async function repoHeading(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const repoCoordinatesResult = getRepoCoordinates(event)
  if (isFailure(repoCoordinatesResult)) return repoCoordinatesResult.failureResult

  // TODO - consider putting this on event / appState
  const refData = await loadUserScopeReferenceData(appState, event.userId)

  const repo = getRepoStructure(refData, repoCoordinatesResult.result)
  if (!repo) return notFoundHTMLResponse

  return createRepoHeadingResponse(repo)
}
