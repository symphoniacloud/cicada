import { AppState } from '../../environment/AppState.js'
import { Route } from '../../internalHttpRouter/internalHttpRoute.js'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes.js'
import { isFailure } from '../../util/structuredResult.js'
import { createRepoHeadingResponse } from './views/repoHeadingView.js'
import { notFoundHTMLResponse } from '../htmlResponses.js'
import { fragmentPath } from '../routingCommon.js'
import { getRepoStructure } from '../../domain/github/userScopeReferenceData.js'
import { parseRepoKeyFromQueryString } from './requestParsing/parseFragmentQueryStrings.js'

export const repoHeadingFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('repo/heading'),
  target: repoHeading
}

export async function repoHeading(_: AppState, event: CicadaAuthorizedAPIEvent) {
  const repoCoordinatesResult = parseRepoKeyFromQueryString(event)
  if (isFailure(repoCoordinatesResult)) return repoCoordinatesResult.failureResult

  const repo = getRepoStructure(event.refData, repoCoordinatesResult.result)
  if (!repo) return notFoundHTMLResponse

  return createRepoHeadingResponse(repo)
}
