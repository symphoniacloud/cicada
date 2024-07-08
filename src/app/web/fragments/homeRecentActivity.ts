import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { getAllAccountIdsForUser } from '../../domain/github/githubMembership'
import { recentActiveBranchesForOwners } from '../../domain/github/githubLatestPushesPerRef'
import { createGithubPushTableResponse } from './views/activityAndStatusView'

export const homeRecentActivityRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: '/app/fragment/homeRecentActivity',
  target: homeRecentActivity
}

export async function homeRecentActivity(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const { userId } = event

  return createGithubPushTableResponse(
    'homeActivity',
    appState.clock,
    await recentActiveBranchesForOwners(appState, await getAllAccountIdsForUser(appState, userId))
  )
}
