import { AppState } from '../../../environment/AppState'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { foundRedirectResponse, redirectResponseWithCookies } from '../../../inboundInterfaces/httpResponses'
import { cookies } from './cicadaAuthCookies'
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy'
import { createRouter } from '../../../internalHttpRouter/internalHttpRouter'
import { oauthCallback } from './oauthCallback'

const router = createRouter([
  {
    // Login means redirecting the user's browser to GitHub, with a few configured values in the URL
    path: '/github/auth/login',
    target: loginResponse
  },
  {
    // Once the user has performed the necessary UX with GitHub, GitHub redirects the user to here
    // A 'code' is provided on the URL which can be swapped by Cicada backend code for a user token
    path: '/github/auth/callback',
    target: oauthCallback
  },
  {
    // Logout doesn't actually touch Github
    path: '/github/auth/logout',
    target: logoutResponse
  }
])

export async function handleGitHubWebAuthRequest(
  appState: AppState,
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  return await router(event)(appState, event)
}

export async function loginResponse(appState: AppState) {
  const webHostname = `${await appState.config.webHostname()}`

  const redirectUri = `https://${webHostname}/github/auth/callback`
  const githubConfig = await appState.config.github()
  const githubClientId = githubConfig.clientId
  return foundRedirectResponse(
    // For now 'state' is just a random value generated during deployment
    // Longer term we can consider using something that updates more frequently
    `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=user:email&state=${githubConfig.githubCallbackState}`
  )
}

// Logout means redirecting to the home page and expiring all of the Cicada cookies
export async function logoutResponse(appState: AppState) {
  const webHostname = `${await appState.config.webHostname()}`

  return redirectResponseWithCookies(
    `https://${webHostname}/index.html`,
    cookies(appState.clock, webHostname, 'none', 'false', -1)
  )
}
