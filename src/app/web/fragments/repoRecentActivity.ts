import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { isFailure } from '../../util/structuredResult'
import { getRepository } from '../../domain/github/githubRepository'
import { getRecentActivityForRepo } from '../../domain/github/githubActivity'
import { getRepoCoordinates } from './requestProcessing/getRepoCoordinates'
import { notFoundHTMLResponse } from '../htmlResponses'
import { createGithubActivityResponse } from './views/activityAndStatusView'

export const repoRecentActivityRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: '/app/fragment/recentActivity',
  target: repoRecentActivity
}

export async function repoRecentActivity(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const repoCoordinatesResult = getRepoCoordinates(event)

  if (isFailure(repoCoordinatesResult)) return repoCoordinatesResult.failureResult
  const { ownerId, repoId } = repoCoordinatesResult.result

  if (!(await getRepository(appState, ownerId, repoId))) return notFoundHTMLResponse

  // TODO eventually - make sure user has permission for this
  // TODO eventually - move repo check into domain logic
  return createGithubActivityResponse(
    'repoActivity',
    appState.clock,
    await getRecentActivityForRepo(appState, ownerId, repoId)
  )
}
