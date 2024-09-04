import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { isFailure } from '../../util/structuredResult'
import { getRepository } from '../../domain/github/githubRepository'
import { createRepoHeadingResponse } from './views/repoHeadingView'
import { notFoundHTMLResponse } from '../htmlResponses'
import { getRepoCoordinates } from './requestParsing/getRepoCoordinates'

export const repoHeadingRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: '/app/fragment/repo/heading',
  target: repoHeading
}

export async function repoHeading(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const repoCoordinatesResult = getRepoCoordinates(event)

  if (isFailure(repoCoordinatesResult)) return repoCoordinatesResult.failureResult

  const repo = await getRepository(appState, repoCoordinatesResult.result)
  if (!repo) return notFoundHTMLResponse

  // TODO eventually - make sure user has permission for this
  return createRepoHeadingResponse(repo)
}
