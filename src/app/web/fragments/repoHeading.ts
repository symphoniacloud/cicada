import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { isFailure } from '../../util/structuredResult'
import { createRepoHeadingResponse } from './views/repoHeadingView'
import { notFoundHTMLResponse } from '../htmlResponses'
import { getRepoCoordinates } from './requestParsing/getRepoCoordinates'
import { fragmentPath } from '../routingCommon'
import { getRepository } from '../../domain/entityStore/entities/GithubRepositoryEntity'

export const repoHeadingFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('repo/heading'),
  target: repoHeading
}

export async function repoHeading(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const repoCoordinatesResult = getRepoCoordinates(event)

  if (isFailure(repoCoordinatesResult)) return repoCoordinatesResult.failureResult

  const repo = await getRepository(appState.entityStore, repoCoordinatesResult.result)
  if (!repo) return notFoundHTMLResponse

  // TODO eventually - make sure user has permission for this
  return createRepoHeadingResponse(repo)
}
