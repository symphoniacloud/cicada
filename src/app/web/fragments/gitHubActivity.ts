import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { isFailure } from '../../util/structuredResult'
import { invalidRequestResponse, notFoundHTMLResponse } from '../htmlResponses'
import {
  createGithubActivityResponse,
  createGithubPushTableResponse,
  createWorkflowRunEventTableResponse
} from './views/activityAndStatusView'
import { getOptionalWorkflowCoordinates } from './requestParsing/getOptionalWorkflowCoordinates'
import { logger } from '../../util/logging'
import {
  GithubAccountId,
  GithubRepoKey,
  GithubUserId,
  GithubWorkflowKey
} from '../../domain/types/GithubKeys'
import {
  getRecentActiveBranchesForUserWithUserSettings,
  getRecentActiveBranchesForUserAndAccount,
  getRecentActivityForRepoForUser,
  getRunEventsForWorkflowForUser
} from '../../domain/user/userVisible'
import { fragmentPath } from '../routingCommon'
import { getAccountForUser } from '../../domain/github/githubAccount'
import { getRepository } from '../../domain/entityStore/entities/GithubRepositoryEntity'

export const gitHubActivityFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('gitHubActivity'),
  target: gitHubActivity
}

export async function gitHubActivity(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const coordinatesResult = getOptionalWorkflowCoordinates(event)

  if (isFailure(coordinatesResult)) return coordinatesResult.failureResult
  const { ownerId, repoId, workflowId } = coordinatesResult.result
  const { userId } = event

  if (ownerId) {
    if (repoId) {
      if (workflowId) {
        return await githubActivityForWorkflow(appState, { ownerId, repoId, workflowId })
      } else {
        return await githubActivityForRepo(appState, { ownerId, repoId })
      }
    } else {
      return await githubActivityForAccount(appState, userId, ownerId)
    }
  }
  if (!ownerId && !repoId && !workflowId) return await githubActivityForDashboard(appState, userId)
  return invalidRequestResponse
}

async function githubActivityForDashboard(appState: AppState, userId: GithubUserId) {
  logger.debug('githubActivityForDashboard')
  return createGithubPushTableResponse(
    'homeActivity',
    appState.clock,
    await getRecentActiveBranchesForUserWithUserSettings(appState, userId)
  )
}

async function githubActivityForAccount(
  appState: AppState,
  userId: GithubUserId,
  accountId: GithubAccountId
) {
  logger.debug('githubActivityForAccount')
  if (!(await getAccountForUser(appState, userId, accountId))) return notFoundHTMLResponse

  return createGithubPushTableResponse(
    'accountActivity',
    appState.clock,
    await getRecentActiveBranchesForUserAndAccount(appState, accountId)
  )
}

async function githubActivityForRepo(appState: AppState, repoKey: GithubRepoKey) {
  logger.debug('githubActivityForRepo')
  if (!(await getRepository(appState.entityStore, repoKey))) return notFoundHTMLResponse

  return createGithubActivityResponse(
    'repoActivity',
    appState.clock,
    await getRecentActivityForRepoForUser(appState, repoKey)
  )
}

async function githubActivityForWorkflow(appState: AppState, workflow: GithubWorkflowKey) {
  logger.debug('githubActivityForWorkflow', { workflow })
  // TODO - check workflow exists

  return createWorkflowRunEventTableResponse(
    'workflowActivity',
    appState.clock,
    await getRunEventsForWorkflowForUser(appState, workflow)
  )
}
