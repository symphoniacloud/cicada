import { APIGatewayProxyHandler } from 'aws-lambda'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware.js'
import { handleGithubSetupRequest } from '../../domain/github/setup/appSetupHandler.js'
import { GithubSetupAppState, githubSetupStartup } from '../../domain/github/setup/githubSetupAppState.js'
import { githubAppIsReady } from '../../domain/github/setup/githubAppReadyCheck.js'
import { pageViewResponse } from '../../web/viewResultWrappers.js'
import { p } from '../../web/hiccough/hiccoughElements.js'

let appState: GithubSetupAppState

export const baseHandler: APIGatewayProxyHandler = async (event) => {
  if (await githubAppIsReady()) return setupAlreadyCompleteResponse

  if (!appState) {
    appState = await githubSetupStartup()
  }

  return await handleGithubSetupRequest(appState, event)
}

const setupAlreadyCompleteResponse = pageViewResponse([p('Cicada is already configured.')], {
  loggedIn: false
})

// Entry point - usage is defined by CDK
// noinspection JSUnusedGlobalSymbols
export const handler = middy(baseHandler).use(powertoolsMiddlewares)
