import { AppState } from '../../environment/AppState'
import { logger } from '../../util/logging'
import { isTestUserToken, processTestToken } from './userAuthorizerForTests'
import { getUserByTokenRecord } from '../github/githubUser'
import { getToken } from './webAuthToken'
import { WithHeadersEvent } from '../../inboundInterfaces/lambdaTypes'
import { getGithubUserTokenOrUndefined } from '../github/githubUserToken'
import { getIdsOfAccountsWhichUserIsMemberOf } from '../github/githubMembership'

import { GithubUserId } from '../types/GithubUserId'

export type AuthorizationResult = SuccessfulAuthorizationResult | undefined

export type SuccessfulAuthorizationResult = {
  username: string
  userId: GithubUserId
}

// Common code used by both API Gateway Lambda Authorizer AND /appa/... Lambda function
// TOEventually - get some Dynamodb caching here
export async function authorizeUserRequest(
  appState: AppState,
  event: WithHeadersEvent
): Promise<AuthorizationResult> {
  const token = getToken(event)
  if (token === undefined) {
    logger.info('No token found')
    return token
  }

  // Use a special token for integration tests so that they don't need to cause calls to GitHub
  if (isTestUserToken(token)) {
    return await processTestToken(appState, token)
  }

  const tokenRecord = await getGithubUserTokenOrUndefined(appState, token)
  if (!tokenRecord) return undefined

  const cicadaUser = await getUserByTokenRecord(appState, tokenRecord)
  // Github token has expired or user has been removed from Cicada
  if (!cicadaUser) return undefined

  // If the user exists in Cicada, but no longer has any memberships, then unauthorized
  // This is the case if the user is removed from a GitHub organization
  const memberOfAccountIds = await getIdsOfAccountsWhichUserIsMemberOf(appState, cicadaUser.id)
  if (memberOfAccountIds.length === 0) return undefined

  // Authorization successful
  return {
    userId: cicadaUser.id,
    username: cicadaUser.login
  }
}
