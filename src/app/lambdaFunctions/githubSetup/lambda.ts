import { APIGatewayProxyHandler } from 'aws-lambda'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware'
import { handleGithubSetupRequest } from '../../domain/github/setup/appSetupHandler'
import { GithubSetupAppState, githubSetupStartup } from '../../domain/github/setup/githubSetupAppState'
import { githubAppIsReady } from '../../domain/github/setup/githubAppReadyCheck'
import { pageViewResultWithoutHtmx } from '../../web/views/viewResultWrappers'
import { p } from '../../web/hiccough/hiccoughElements'

let appState: GithubSetupAppState

export const baseHandler: APIGatewayProxyHandler = async (event) => {
  if (await githubAppIsReady()) return setupAlreadyCompleteResponse

  if (!appState) {
    appState = await githubSetupStartup()
  }

  return await handleGithubSetupRequest(appState, event)
}

const setupAlreadyCompleteResponse = pageViewResultWithoutHtmx([p('Cicada is already configured.')], false)

// Entry point - usage is defined by CDK
// noinspection JSUnusedGlobalSymbols
export const handler = middy(baseHandler).use(powertoolsMiddlewares)
