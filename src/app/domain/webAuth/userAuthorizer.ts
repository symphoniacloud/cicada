import { AppState } from '../../environment/AppState.js'
import { logger } from '../../util/logging.js'
import { isTestUserToken, processTestToken } from './userAuthorizerForTests.js'
import { getUserByTokenUsingTokenCache } from '../github/githubUser.js'
import { WithHeadersEvent } from '../../inboundInterfaces/lambdaTypes.js'

import { GitHubUserId } from '../../ioTypes/GitHubTypes.js'
import { failedWith, isFailure, Result, successWith } from '../../util/structuredResult.js'

export type AuthorizationResult = {
  username: string
  userId: GitHubUserId
}

// Common code used by both API Gateway Lambda Authorizer AND /appa/... Lambda function
export async function authorizeUserRequest(
  appState: AppState,
  event: WithHeadersEvent
): Promise<Result<AuthorizationResult>> {
  const token = getToken(event)
  if (token === undefined) {
    logger.info('No token found')
    return failedWith('No token found')
  }

  // Use a special token for integration tests so that they don't need to cause calls to GitHub
  if (isTestUserToken(token)) {
    return await processTestToken(appState, token)
  }

  const cicadaUserResult = await getUserByTokenUsingTokenCache(appState, token)
  if (isFailure(cicadaUserResult)) return cicadaUserResult

  // Authorization successful
  return successWith({
    userId: cicadaUserResult.result.userId,
    // Careful - change in case here
    username: cicadaUserResult.result.userName
  })
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
