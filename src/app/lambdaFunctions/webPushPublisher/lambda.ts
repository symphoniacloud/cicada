import { AppState } from '../../environment/AppState'
import { lambdaStartup } from '../../environment/lambdaStartup'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware'
import { EventBridgeHandler } from 'aws-lambda'
import { EventBridgeDetailType } from '../../../multipleContexts/eventBridge'
import { processEventBridgeWebPushEvent } from '../../domain/webPush/webPushEventBridgeEventProcessor'

let appState: AppState

export const baseHandler: EventBridgeHandler<EventBridgeDetailType, unknown, unknown> = async (event) => {
  if (!appState) {
    appState = await lambdaStartup()
  }

  await processEventBridgeWebPushEvent(appState, event)
}

// Entry point - usage is defined by CDK
// noinspection JSUnusedGlobalSymbols
export const handler = middy(baseHandler).use(powertoolsMiddlewares)
