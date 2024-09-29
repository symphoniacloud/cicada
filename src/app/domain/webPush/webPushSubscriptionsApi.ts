import { AppState } from '../../environment/AppState'
import { deregisterSubscription, registerSubscription } from './webPushSubscriptions'
import {
  jsonOkResult,
  responseWithStatusCode,
  withJSONContentType
} from '../../inboundInterfaces/httpResponses'
import { sendToEventBridge } from '../../outboundInterfaces/eventBridgeBus'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../multipleContexts/eventBridge'
import { userIdFromEvent, usernameFromEvent } from '../webAuth/webAuth'
import { usernameFieldMissingFromContextResponse } from '../../inboundInterfaces/standardHttpResponses'
import { CicadaAPIAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { isSuccess } from '../../util/structuredResult'

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
