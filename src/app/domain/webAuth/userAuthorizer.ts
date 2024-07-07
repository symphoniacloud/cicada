import { AppState } from '../../environment/AppState'
import { logger } from '../../util/logging'
import { processTestToken } from './userAuthorizerForTests'
import { getUserByAuthToken } from '../github/githubUser'
import { getAllAccountIdsForUser } from '../github/githubMembership'

export type WithHeadersEvent = {
  headers: { [name: string]: string | undefined } | null
  multiValueHeaders: {
    [name: string]: string[] | undefined
  } | null
}

export type AuthorizationResult = SuccessfulAuthorizationResult | undefined

export type SuccessfulAuthorizationResult = {
  username: string
  userId: number
}

// Common code used by both API Gateway Lambda Authorizer AND /appa/... Lambda function
// TODO - eventually do a cached lookup to Github to avoid calling GitHub every time
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
  if (token.indexOf('testuser') >= 0) {
    return await processTestToken(appState, token)
  }

  // Makes a call to GitHub to get user ID, then use that to get Cicada user from DB
  // If either fail (e.g. token no longer valid at GitHub, or user not registered in Cicada)
  // then unauthorized
  const cicadaUser = await getUserByAuthToken(appState, token)
  if (!cicadaUser) return undefined

  // If the user exists in Cicada, but no longer has any memberships, then unauthorized
  // This is the case if the user is removed from a GitHub organization
  const accountIds = await getAllAccountIdsForUser(appState, cicadaUser.id)
  if (accountIds.length === 0) return undefined

  // Authorization successful
  return {
    userId: cicadaUser.id,
    username: cicadaUser.login
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
