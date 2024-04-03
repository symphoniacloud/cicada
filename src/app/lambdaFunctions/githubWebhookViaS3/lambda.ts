import { AppState } from '../../environment/AppState'
import { lambdaStartup } from '../../environment/lambdaStartup'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware'
import { EventBridgeHandler } from 'aws-lambda'
import {
  processWebhookFromS3Event,
  S3EventDetail
} from '../../domain/github/webhookProcessor/githubWebhookProcessor'

let appState: AppState

export const baseHandler: EventBridgeHandler<string, S3EventDetail, unknown> = async (event) => {
  if (!appState) {
    appState = await lambdaStartup()
  }
  await processWebhookFromS3Event(appState, event)
}

// Entry point - usage is defined by CDK
// noinspection JSUnusedGlobalSymbols
export const handler = middy(baseHandler).use(powertoolsMiddlewares)
