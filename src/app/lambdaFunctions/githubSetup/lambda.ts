import { APIGatewayProxyHandler } from 'aws-lambda'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware'
import { handleGithubSetupRequest } from '../../domain/github/setup/appSetupHandler'
import { GithubSetupAppState, githubSetupStartup } from '../../domain/github/setup/githubSetupAppState'

let appState: GithubSetupAppState

export const baseHandler: APIGatewayProxyHandler = async (event) => {
  if (!appState) {
    appState = await githubSetupStartup()
  }

  return await handleGithubSetupRequest(appState, event)
}

// Entry point - usage is defined by CDK
// noinspection JSUnusedGlobalSymbols
export const handler = middy(baseHandler).use(powertoolsMiddlewares)
