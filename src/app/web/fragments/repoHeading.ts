import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { isFailure } from '../../util/structuredResult'
import { getRepository } from '../../domain/github/githubRepository'
import { createRepoHeadingResponse } from './views/repoHeadingView'
import { notFoundHTMLResponse } from '../../inboundInterfaces/htmlResponses'
import { getRepoCoordinates } from './requestProcessing/getRepoCoordinates'

export const repoHeadingRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: '/app/fragment/repo/heading',
  target: repoHeading
}

export async function repoHeading(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const repoCoordinatesResult = getRepoCoordinates(event)

  if (isFailure(repoCoordinatesResult)) return repoCoordinatesResult.failureResult
  const { ownerId, repoId } = repoCoordinatesResult.result

  const repo = await getRepository(appState, ownerId, repoId)
  if (!repo) return notFoundHTMLResponse

  // TODO eventually - make sure user has permission for this
  return createRepoHeadingResponse(repo)
}
