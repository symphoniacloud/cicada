import { APIGatewayProxyHandler } from 'aws-lambda'
import { AppState } from '../../environment/AppState'
import { lambdaStartup } from '../../environment/lambdaStartup'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware'
import { handleGitHubWebAuthRequest } from '../../domain/github/githubUserAuth/githubWebAuthHandler'
import { logger } from '../../util/logging'
import { isFailure } from '../../util/structuredResult'
import { pageViewResultWithoutHtmx } from '../../web/viewResultWrappers'
import { startSetupRoute } from '../../domain/github/setup/startGithubSetup'

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

export const setupRequiredResponse = pageViewResultWithoutHtmx(
  // TODO - use hiccough elements
  [
    `<p>
Cicada GitHub app not ready yet. <a href="${startSetupRoute.path}">Go here to start the setup process</a>.
</p>`
  ],
  false
)

// Entry point - usage is defined by CDK
// noinspection JSUnusedGlobalSymbols
export const handler = middy(baseHandler).use(powertoolsMiddlewares)
