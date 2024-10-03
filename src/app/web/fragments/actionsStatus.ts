import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { isFailure } from '../../util/structuredResult'
import { invalidRequestResponse, notFoundHTMLResponse } from '../htmlResponses'
import { createWorkflowRunEventTableResponse } from './views/activityAndStatusView'
import { getOptionalRepoCoordinates } from './requestParsing/getOptionalRepoCoordinates'
import {
  getLatestWorkflowRunEventsForAccountForUser,
  getLatestWorkflowRunEventsForRepoForUser,
  getLatestWorkflowRunEventsForUserWithUserSettings
} from '../../domain/user/userVisible'
import { GithubRepoKey } from '../../domain/types/GithubKeys'
import { fragmentPath } from '../routingCommon'
import { getRepository } from '../../domain/entityStore/entities/GithubRepositoryEntity'
import { GithubAccountId } from '../../domain/types/GithubAccountId'
import { GithubUserId } from '../../domain/types/GithubUserId'
import {
  accountStructureFromInstallationAccountStructure,
  loadInstallationAccountStructureForUser
} from '../../domain/github/githubAccountStructure'

export const actionsStatusFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('actionsStatus'),
  target: actionsStatus
}

export async function actionsStatus(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const coordinatesResult = getOptionalRepoCoordinates(event)

  if (isFailure(coordinatesResult)) return coordinatesResult.failureResult
  const { accountId, repoId } = coordinatesResult.result

  if (accountId && repoId) return await actionsStatusForRepo(appState, { accountId, repoId })
  if (accountId) return await actionsStatusForAccount(appState, event.userId, accountId)
  if (!accountId && !repoId) return await actionsStatusForDashboard(appState, event.userId)
  return invalidRequestResponse
}

async function actionsStatusForDashboard(appState: AppState, userId: GithubUserId) {
  const latestEvents = await getLatestWorkflowRunEventsForUserWithUserSettings(appState, userId)
  return createWorkflowRunEventTableResponse('homeStatus', appState.clock, latestEvents)
}

async function actionsStatusForAccount(appState: AppState, userId: GithubUserId, accountId: GithubAccountId) {
  const githubInstallationAccountStructure = await loadInstallationAccountStructureForUser(appState, userId)
  if (!accountStructureFromInstallationAccountStructure(githubInstallationAccountStructure, accountId))
    return notFoundHTMLResponse

  const latestEvents = await getLatestWorkflowRunEventsForAccountForUser(appState, accountId)
  return createWorkflowRunEventTableResponse('accountStatus', appState.clock, latestEvents)
}

async function actionsStatusForRepo(appState: AppState, repoKey: GithubRepoKey) {
  // TODO - check has access - here or in userVisible.ts
  if (!(await getRepository(appState.entityStore, repoKey))) return notFoundHTMLResponse

  const latestEvents = await getLatestWorkflowRunEventsForRepoForUser(appState, repoKey)
  return createWorkflowRunEventTableResponse('repoStatus', appState.clock, latestEvents)
}
