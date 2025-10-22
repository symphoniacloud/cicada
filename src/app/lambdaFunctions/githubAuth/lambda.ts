import { APIGatewayProxyHandler } from 'aws-lambda'
import { AppState } from '../../environment/AppState.js'
import { lambdaStartup } from '../../environment/lambdaStartup.js'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware.js'
import { handleGitHubWebAuthRequest } from '../../domain/github/githubUserAuth/githubWebAuthHandler.js'
import { logger } from '../../util/logging.js'
import { isFailure } from '../../util/structuredResult.js'
import { pageViewResponse } from '../../web/viewResultWrappers.js'
import { startSetupRoute } from '../../domain/github/setup/startGithubSetup.js'

let appState: AppState

export const baseHandler: APIGatewayProxyHandler = async (event) => {
  if (!appState) {
    const startup = await lambdaStartup()
    if (isFailure(startup)) {
      logger.info('Github App not ready, returning boilerplate page')
      return setupRequiredResponse
    }

    appState = startup.result
  }
  return await handleGitHubWebAuthRequest(appState, event)
}

export const setupRequiredResponse = pageViewResponse(
  // TODO - use hiccough elements
  [
    `<p>
Cicada GitHub app not ready yet. <a href="${startSetupRoute.path}">Go here to start the setup process</a>.
</p>`
  ],
  { loggedIn: false }
)

// Entry point - usage is defined by CDK
// noinspection JSUnusedGlobalSymbols
export const handler = middy(baseHandler).use(powertoolsMiddlewares)
