import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { isFailure } from '../../util/structuredResult'
import { getRepository } from '../../domain/github/githubRepository'
import { invalidRequestResponse, notFoundHTMLResponse } from '../htmlResponses'
import { createWorkflowRunEventTableResponse } from './views/activityAndStatusView'
import { getOptionalRepoCoordinates } from './requestParsing/getOptionalRepoCoordinates'
import {
  getLatestWorkflowRunEventsForUser,
  getLatestWorkflowRunEventsForRepoForUser,
  getLatestWorkflowRunEventsForAccountForUser
} from '../../domain/user/userVisible'
import { GithubAccountId, GithubRepoKey, GithubUserId } from '../../domain/types/GithubKeys'
import { fragmentPath } from '../routingCommon'
import { getAccountForUser } from '../../domain/github/githubAccount'

export const actionsStatusFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('actionsStatus'),
  target: actionsStatus
}

export async function actionsStatus(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const coordinatesResult = getOptionalRepoCoordinates(event)

  if (isFailure(coordinatesResult)) return coordinatesResult.failureResult
  const { ownerId, repoId } = coordinatesResult.result

  if (ownerId && repoId) return await actionsStatusForRepo(appState, event.userId, { ownerId, repoId })
  if (ownerId) return await actionsStatusForAccount(appState, event.userId, ownerId)
  if (!ownerId && !repoId) return await actionsStatusForHome(appState, event.userId)
  return invalidRequestResponse
}

async function actionsStatusForRepo(appState: AppState, userId: GithubUserId, repoKey: GithubRepoKey) {
  if (!(await getRepository(appState, repoKey))) return notFoundHTMLResponse

  const latestEvents = await getLatestWorkflowRunEventsForRepoForUser(appState, userId, repoKey)
  return createWorkflowRunEventTableResponse('repoStatus', appState.clock, latestEvents)
}

async function actionsStatusForAccount(appState: AppState, userId: GithubUserId, accountId: GithubAccountId) {
  if (!(await getAccountForUser(appState, userId, accountId))) return notFoundHTMLResponse

  const latestEvents = await getLatestWorkflowRunEventsForAccountForUser(appState, userId, accountId)
  return createWorkflowRunEventTableResponse('accountStatus', appState.clock, latestEvents)
}

async function actionsStatusForHome(appState: AppState, userId: number) {
  const latestEvents = await getLatestWorkflowRunEventsForUser(appState, userId)
  return createWorkflowRunEventTableResponse('homeStatus', appState.clock, latestEvents)
}
