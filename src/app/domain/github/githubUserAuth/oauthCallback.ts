import { APIGatewayProxyEvent } from 'aws-lambda'
import { AppState } from '../../../environment/AppState'
import { logger } from '../../../util/logging'
import { redirectResponseWithCookies } from '../../../inboundInterfaces/httpResponses'
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy'
import { getUserByAuthToken } from '../githubUser'
import { cookies } from './cicadaAuthCookies'
import { generatePageViewResultWithoutHtmx } from '../../../web/views/viewResultWrappers'

export async function oauthCallback(
  appState: AppState,
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    return tryOauthCallback(appState, event)
  } catch (e) {
    logger.error(`Unexpected error for oauthCallback`, e as Error)
    return failedToLoginResult(`Unable to login due to unexpected error`)
  }
}

// Github sets two query string parameters when redirecting the user back to Cicada:
// `code` - a generated short-term value that Cicada can use for getting an actual token
// `state` - a value which Cicada set during login - used to make sure this part of an actual login process
async function tryOauthCallback(
  appState: AppState,
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const code = event.queryStringParameters?.code
  const state = event.queryStringParameters?.state

  if (!code) {
    return failedToLoginResult(`Unable to login because there was no code on request`)
  }

  const githubConfig = await appState.config.github()

  // See comment in login - would be better to generate this per request
  if (!state || !(state === githubConfig.githubCallbackState)) {
    return failedToLoginResult(`Unable to login because there was invalid state on request`)
  }

  // TOEventually - proper error handling here - e.g. what if code was invalid? Does this throw or return undefined
  const { token } = await appState.githubClient.createOAuthUserAuth(code)

  const cicadaUser = await getUserByAuthToken(appState, token)
  if (!cicadaUser) {
    return failedToLoginResult(`Not a valid user for this Cicada instance`)
  }

  // For now we just validate that the user is / was ever a cicada user
  // TOEventually - check memberships too, just like we do in userAuthorizer
  logger.debug(`Valid user: ${cicadaUser.login}`)

  // For now the cookie token Cicada uses is precisely the GitHub user token. In theory Cicada
  // could generate its own tokens and then keep a database table mapping those tokens to users, but
  // for now using Github's token is sufficient
  const webHostname = `${await appState.config.webHostname()}`
  return redirectResponseWithCookies(
    `https://${webHostname}/app.html`,
    cookies(appState.clock, webHostname, token, 'true', 3)
  )
}

function failedToLoginResult(message: string): APIGatewayProxyResult {
  return {
    ...generatePageViewResultWithoutHtmx(`<p>${message}</p>`),
    statusCode: 400
  }
}
