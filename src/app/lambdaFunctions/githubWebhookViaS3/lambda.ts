import { AppState } from '../../environment/AppState.js'
import { lambdaStartup } from '../../environment/lambdaStartup.js'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware.js'
import { EventBridgeHandler } from 'aws-lambda'
import {
  processGitHubWebhookFromS3Event,
  S3EventDetail
} from '../../domain/github/webhookProcessor/githubWebhookProcessor.js'
import { logger } from '../../util/logging.js'
import { isFailure } from '../../util/structuredResult.js'

let appState: AppState

export const baseHandler: EventBridgeHandler<string, S3EventDetail, unknown> = async (event) => {
  if (!appState) {
    const startup = await lambdaStartup()
    if (isFailure(startup)) {
      logger.error(
        'Github App not ready - not processing webhook event from GitHub. Did something go wrong with setup process?'
      )
      return
    }

    appState = startup.result
  }
  await processGitHubWebhookFromS3Event(appState, event)
}

// Entry point - usage is defined by CDK
// noinspection JSUnusedGlobalSymbols
export const handler = middy(baseHandler).use(powertoolsMiddlewares)
