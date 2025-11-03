import { AppState } from '../../environment/AppState.js'
import { deregisterSubscription, registerSubscription } from './webPushSubscriptions.js'
import { jsonOkResult } from '../../inboundInterfaces/httpResponses.js'
import { sendToEventBridge } from '../../outboundInterfaces/eventBridgeBus.js'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../multipleContexts/eventBridge.js'
import { CicadaAPIAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes.js'
import { Route } from '../../internalHttpRouter/internalHttpRoute.js'
import { authenticateApiPath } from '../../web/routingCommon.js'
import {
  WebPushSubscribeRequestSchema,
  WebPushUnsubscribeRequestSchema
} from '../../ioTypes/WebPushSchemasAndTypes.js'
import { APIEventSchema } from '../../ioTypes/zodUtil.js'
import { githubUserSummaryFromEvent, userIdFromApiEvent } from '../webAuth/webAuth.js'
import { parseAPIEventWithSchema } from '../../inboundInterfaces/httpRequests.js'

export const webPushSubscribeRoute: Route<CicadaAPIAuthorizedAPIEvent> = {
  path: authenticateApiPath('webPushSubscribe'),
  method: 'POST',
  target: handleWebPushSubscribe
}

export const webPushUnsubscribeRoute: Route<CicadaAPIAuthorizedAPIEvent> = {
  path: authenticateApiPath('webPushUnsubscribe'),
  method: 'POST',
  target: handleWebPushUnsubscribe
}

export const webPushTestRoute: Route<CicadaAPIAuthorizedAPIEvent> = {
  path: authenticateApiPath('ping'),
  method: 'POST',
  target: handleWebPushTest
}

export async function handleWebPushSubscribe(appState: AppState, event: CicadaAPIAuthorizedAPIEvent) {
  const parseResult = parseAPIEventWithSchema(event, WebPushSubscribeRequestSchema)
  if (!parseResult.isSuccessResult) {
    return parseResult.failureResult
  }

  await registerSubscription(appState, {
    ...githubUserSummaryFromEvent(parseResult.result),
    ...parseResult.result.body
  })
  return jsonOkResult({ message: 'successfully subscribed' })
}

export async function handleWebPushUnsubscribe(appState: AppState, event: CicadaAPIAuthorizedAPIEvent) {
  const parseResult = parseAPIEventWithSchema(event, WebPushUnsubscribeRequestSchema)
  if (!parseResult.isSuccessResult) {
    return parseResult.failureResult
  }

  await deregisterSubscription(
    appState,
    userIdFromApiEvent(parseResult.result),
    parseResult.result.body.endpoint
  )
  return jsonOkResult({ message: 'successfully unsubscribed' })
}

export async function handleWebPushTest(appState: AppState, event: CicadaAPIAuthorizedAPIEvent) {
  const parseResult = parseAPIEventWithSchema(event, APIEventSchema)
  if (!parseResult.isSuccessResult) {
    return parseResult.failureResult
  }

  await sendToEventBridge(
    appState,
    EVENTBRIDGE_DETAIL_TYPES.WEB_PUSH_TEST,
    githubUserSummaryFromEvent(parseResult.result)
  )
  return jsonOkResult({ message: 'Web Push Test OK' })
}
