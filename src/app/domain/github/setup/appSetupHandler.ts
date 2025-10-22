import { createRouter } from '../../../internalHttpRouter/internalHttpRouter.js'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { APIGatewayProxyResult } from 'aws-lambda'
import { GithubSetupAppState } from './githubSetupAppState.js'
import { startSetupRoute } from './startGithubSetup.js'
import { setupRedirectRoute } from './processGithubSetupRedirect.js'

const router = createRouter([startSetupRoute, setupRedirectRoute])

export async function handleGithubSetupRequest(
  appState: GithubSetupAppState,
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  return await router(event)(appState, event)
}
