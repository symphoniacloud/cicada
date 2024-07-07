import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { latestWorkflowRunEventsPerWorkflowForOwners } from '../../domain/github/githubLatestWorkflowRunEvents'
import { getAllAccountIdsForUser } from '../../domain/github/githubMembership'
import { createHomeActionsStatusResponse } from './views/homeActionsStatusView'

export const homeActionsStatusRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: '/app/fragment/homeActionsStatus',
  target: homeActionsStatus
}

export async function homeActionsStatus(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const { userId } = event

  const accountIds = await getAllAccountIdsForUser(appState, userId),
    workflowStatus = await latestWorkflowRunEventsPerWorkflowForOwners(appState, accountIds)

  return createHomeActionsStatusResponse(appState.clock, workflowStatus)
}
