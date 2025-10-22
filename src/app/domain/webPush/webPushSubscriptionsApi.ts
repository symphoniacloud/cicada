import { AppState } from '../../environment/AppState.js'
import { deregisterSubscription, registerSubscription } from './webPushSubscriptions.js'
import {
  jsonOkResult,
  responseWithStatusCode,
  withJSONContentType
} from '../../inboundInterfaces/httpResponses.js'
import { sendToEventBridge } from '../../outboundInterfaces/eventBridgeBus.js'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../multipleContexts/eventBridge.js'
import { userIdFromEvent, usernameFromEvent } from '../webAuth/webAuth.js'
import { usernameFieldMissingFromContextResponse } from '../../inboundInterfaces/standardHttpResponses.js'
import { CicadaAPIAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes.js'
import { isSuccess } from '../../util/structuredResult.js'
import { Route } from '../../internalHttpRouter/internalHttpRoute.js'
import { authenticateApiPath } from '../../web/routingCommon.js'

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
  const username = usernameFromEvent(event),
    userId = userIdFromEvent(event)
  if (!username) return usernameFieldMissingFromContextResponse()

  const response = await registerSubscription(appState, userId, username, event.body ?? '')
  return isSuccess(response)
    ? jsonOkResult({ message: 'successfully subscribed' })
    : withJSONContentType(responseWithStatusCode(400, { message: response.reason }))
}

export async function handleWebPushUnsubscribe(appState: AppState, event: CicadaAPIAuthorizedAPIEvent) {
  const userId = userIdFromEvent(event)

  const response = await deregisterSubscription(appState, userId, event.body ?? '')
  return isSuccess(response)
    ? jsonOkResult({ message: 'successfully unsubscribed' })
    : withJSONContentType(responseWithStatusCode(400, { message: response.reason }))
}

export async function handleWebPushTest(appState: AppState, event: CicadaAPIAuthorizedAPIEvent) {
  const userId = userIdFromEvent(event)

  await sendToEventBridge(appState, EVENTBRIDGE_DETAIL_TYPES.WEB_PUSH_TEST, {
    userId
  })
  return jsonOkResult({ message: 'Web Push Test OK' })
}
