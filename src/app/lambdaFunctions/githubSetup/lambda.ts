import { APIGatewayProxyHandler } from 'aws-lambda'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware'
import { handleGithubSetupRequest } from '../../domain/github/setup/appSetupHandler'
import { GithubSetupAppState, githubSetupStartup } from '../../domain/github/setup/githubSetupAppState'
import { githubAppIsReady } from '../../domain/github/setup/githubAppReadyCheck'
import { generateFragmentViewResult } from '../../web/views/viewResultWrappers'

let appState: GithubSetupAppState

export const baseHandler: APIGatewayProxyHandler = async (event) => {
  if (await githubAppIsReady()) return setupAlreadyCompleteResponse

  if (!appState) {
    appState = await githubSetupStartup()
  }

  return await handleGithubSetupRequest(appState, event)
}

const setupAlreadyCompleteResponse = generateFragmentViewResult(`<p>
Cicada is already configured. <a href="/">Return to home</a>
</p>`)

// Entry point - usage is defined by CDK
// noinspection JSUnusedGlobalSymbols
export const handler = middy(baseHandler).use(powertoolsMiddlewares)
