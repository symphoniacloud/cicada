import { AppState } from '../environment/AppState'
import { latestWorkflowRunEventsPerWorkflowForOwners } from '../domain/github/githubLatestWorkflowRunEvents'
import { recentActiveBranchesForOwners } from '../domain/github/githubLatestPushesPerRef'
import { createShowLatestActivityResponse } from './views/showLatestActivityView'
import { getAllAccountIdsForUser } from '../domain/github/githubMembership'
import { Route } from '../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../inboundInterfaces/lambdaTypes'

export const showLatestActivityRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: '/app/fragment/latestActivity',
  target: showLatestActivity
}

// TOEventually - don't show pushes where there's already a workflow run row?
export async function showLatestActivity(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const { userId } = event

  const accountIds = await getAllAccountIdsForUser(appState, userId),
    workflowStatus = await latestWorkflowRunEventsPerWorkflowForOwners(appState, accountIds),
    recentPushes = await recentActiveBranchesForOwners(appState, accountIds)

  return createShowLatestActivityResponse(appState.clock, workflowStatus, recentPushes)
}
