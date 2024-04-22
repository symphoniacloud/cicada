import { AppState } from '../../environment/AppState'
import { lambdaStartup } from '../../environment/lambdaStartup'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware'
import { jsonOkResult } from '../../inboundInterfaces/httpResponses'
import { userIdFromEvent, usernameFromEvent } from '../../domain/webAuth/webAuth'
import {
  handleWebPushSubscribe,
  handleWebPushTest,
  handleWebPushUnsubscribe
} from '../../domain/webPush/webPushSubscriptionsApi'
import { createRouter } from '../../internalHttpRouter/internalHttpRouter'
import {
  userIdFieldMissingFromContextResponse,
  usernameFieldMissingFromContextResponse
} from '../../inboundInterfaces/standardHttpResponses'
import {
  CicadaAPIAuthorizedAPIEvent,
  CicadaAPIAuthorizedAPIHandler
} from '../../inboundInterfaces/lambdaTypes'
import { logger } from '../../util/logging'
import { isFailure } from '../../util/structuredResult'

const router = createRouter([
  {
    path: '/apia/webPushSubscribe',
    method: 'POST',
    target: handleWebPushSubscribe
  },
  {
    path: '/apia/webPushUnsubscribe',
    method: 'POST',
    target: handleWebPushUnsubscribe
  },
  {
    path: '/apia/ping',
    method: 'POST',
    target: handleWebPushTest
  },
  {
    path: '/apia/hello',
    method: 'GET',
    target: handleHello
  }
])

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
