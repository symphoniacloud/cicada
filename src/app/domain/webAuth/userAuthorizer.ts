import { AppState } from '../../environment/AppState.js'
import { logger } from '../../util/logging.js'
import { isTestUserToken, processTestToken } from './userAuthorizerForTests.js'
import { getUserByTokenUsingTokenCache } from '../github/githubUser.js'
import { WithHeadersEvent } from '../../inboundInterfaces/lambdaTypes.js'

import { GitHubUserId } from '../../ioTypes/GitHubTypes.js'

export type AuthorizationResult = SuccessfulAuthorizationResult | undefined

export type SuccessfulAuthorizationResult = {
  username: string
  userId: GitHubUserId
}

// Common code used by both API Gateway Lambda Authorizer AND /appa/... Lambda function
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

  const cicadaUser = await getUserByTokenUsingTokenCache(appState, token)
  if (!cicadaUser) return undefined

  // Authorization successful
  return {
    userId: cicadaUser.userId,
    username: cicadaUser.userName
  }
}

function getToken(event: WithHeadersEvent) {
  const tokenCookie = getTokenCookie(event)
  return tokenCookie ? tokenCookie.split('=')[1] : undefined
}

// Using both single and multi value headers because there may only be one cookie
// if user manually delete "isLoggedIn" cookie, otherwise more than one
function getTokenCookie(event: WithHeadersEvent) {
  const singleHeaderTokenCookie = (event.headers?.Cookie ?? '')
    .split(';')
    .map((x) => x.trim())
    .find((x) => x.startsWith('token='))

  if (singleHeaderTokenCookie) return singleHeaderTokenCookie

  return (event.multiValueHeaders?.Cookie ?? []).find((x) => x.startsWith('token='))
}
