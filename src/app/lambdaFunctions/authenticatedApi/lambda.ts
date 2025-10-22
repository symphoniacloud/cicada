import { AppState } from '../../environment/AppState.js'
import { lambdaStartup } from '../../environment/lambdaStartup.js'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware.js'
import { jsonOkResult } from '../../inboundInterfaces/httpResponses.js'
import { userIdFromEvent, usernameFromEvent } from '../../domain/webAuth/webAuth.js'
import {
  webPushSubscribeRoute,
  webPushTestRoute,
  webPushUnsubscribeRoute
} from '../../domain/webPush/webPushSubscriptionsApi.js'
import { createRouter } from '../../internalHttpRouter/internalHttpRouter.js'
import {
  userIdFieldMissingFromContextResponse,
  usernameFieldMissingFromContextResponse
} from '../../inboundInterfaces/standardHttpResponses.js'
import {
  CicadaAPIAuthorizedAPIEvent,
  CicadaAPIAuthorizedAPIHandler
} from '../../inboundInterfaces/lambdaTypes.js'
import { logger } from '../../util/logging.js'
import { isFailure } from '../../util/structuredResult.js'
import { Route } from '../../internalHttpRouter/internalHttpRoute.js'
import { authenticateApiPath } from '../../web/routingCommon.js'

export const apiHelloRoute: Route<CicadaAPIAuthorizedAPIEvent> = {
  path: authenticateApiPath('hello'),
  method: 'GET',
  target: handleHello
}

const router = createRouter([webPushSubscribeRoute, webPushUnsubscribeRoute, webPushTestRoute, apiHelloRoute])

let appState: AppState

export const baseHandler: CicadaAPIAuthorizedAPIHandler = async (event) => {
  if (!appState) {
    const startup = await lambdaStartup()
    if (isFailure(startup)) {
      logger.error(
        'Lambda function should not have been called - Github App not setup, and request should have been blocked by authorizer'
      )
      throw new Error(
        'Lambda function should not have been called - Github App not setup, and request should have been blocked by authorizer'
      )
    }

    appState = startup.result
  }
  return await handleApiMessage(appState, event)
}

export async function handleApiMessage(appState: AppState, event: CicadaAPIAuthorizedAPIEvent) {
  return await router(event)(appState, event)
}

async function handleHello(_: AppState, event: CicadaAPIAuthorizedAPIEvent) {
  const username = usernameFromEvent(event),
    userId = userIdFromEvent(event)

  if (!username) return usernameFieldMissingFromContextResponse()
  if (!userId) return userIdFieldMissingFromContextResponse()

  return jsonOkResult({
    username,
    userId
  })
}

// Entry point - usage is defined by CDK
// noinspection JSUnusedGlobalSymbols
export const handler = middy(baseHandler).use(powertoolsMiddlewares)
