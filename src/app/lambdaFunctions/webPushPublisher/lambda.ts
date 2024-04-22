import { AppState } from '../../environment/AppState'
import { lambdaStartup } from '../../environment/lambdaStartup'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware'
import { EventBridgeHandler } from 'aws-lambda'
import { EventBridgeDetailType } from '../../../multipleContexts/eventBridge'
import { processEventBridgeWebPushEvent } from '../../domain/webPush/webPushEventBridgeEventProcessor'
import { logger } from '../../util/logging'
import { isFailure } from '../../util/structuredResult'

let appState: AppState

export const baseHandler: EventBridgeHandler<EventBridgeDetailType, unknown, unknown> = async (event) => {
  if (!appState) {
    const startup = await lambdaStartup()
    if (isFailure(startup)) {
      logger.error(
        'Github App not ready - should not be getting web push requests. Did someone manually delete Github SSM config?'
      )
      return
    }

    appState = startup.result
  }

  await processEventBridgeWebPushEvent(appState, event)
}

// Entry point - usage is defined by CDK
// noinspection JSUnusedGlobalSymbols
export const handler = middy(baseHandler).use(powertoolsMiddlewares)
