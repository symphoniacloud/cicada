import { APIGatewayProxyHandler } from 'aws-lambda'
import { AppState } from '../../environment/AppState'
import { lambdaStartup } from '../../environment/lambdaStartup'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware'
import { handleGitHubWebAuthRequest } from '../../domain/github/githubUserAuth/githubWebAuthHandler'

let appState: AppState

export const baseHandler: APIGatewayProxyHandler = async (event) => {
  if (!appState) {
    appState = await lambdaStartup()
  }
  return await handleGitHubWebAuthRequest(appState, event)
}

// Entry point - usage is defined by CDK
// noinspection JSUnusedGlobalSymbols
export const handler = middy(baseHandler).use(powertoolsMiddlewares)
