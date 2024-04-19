import { createRouter } from '../../../internalHttpRouter/internalHttpRouter'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy'
import { GithubSetupAppState } from './githubSetupAppState'
import { startSetupRoute } from './startGithubSetup'
import { setupRedirectRoute } from './processGithubSetupRedirect'

const router = createRouter([startSetupRoute, setupRedirectRoute])

export async function handleGithubSetupRequest(
  appState: GithubSetupAppState,
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  return await router(event)(appState, event)
}
