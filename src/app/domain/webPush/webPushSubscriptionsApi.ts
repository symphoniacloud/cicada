import { AppState } from '../../environment/AppState.js'
import { deregisterSubscription, registerSubscription } from './webPushSubscriptions.js'
import {
  jsonOkResult,
  responseWithStatusCode,
  withJSONContentType
} from '../../inboundInterfaces/httpResponses.js'
import { sendToEventBridge } from '../../outboundInterfaces/eventBridgeBus.js'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../multipleContexts/eventBridge.js'
import { CicadaAPIAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes.js'
import { Route } from '../../internalHttpRouter/internalHttpRoute.js'
import { authenticateApiPath } from '../../web/routingCommon.js'
import {
  WebPushSubscribeRequestSchema,
  WebPushUnsubscribeRequestSchema
} from '../../ioTypes/WebPushSchemasAndTypes.js'
import { logger } from '../../util/logging.js'
import { APIEventSchema } from '../../ioTypes/zodUtil.js'
import { githubUserSummaryFromEvent, userIdFromApiEvent } from '../webAuth/webAuth.js'

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
  const parseResult = WebPushSubscribeRequestSchema.safeParse(event)
  if (!parseResult.success) {
    return processParseFailure(parseResult)
  }

  await registerSubscription(appState, {
    ...githubUserSummaryFromEvent(parseResult.data),
    ...parseResult.data.body
  })
  return jsonOkResult({ message: 'successfully subscribed' })
}

export async function handleWebPushUnsubscribe(appState: AppState, event: CicadaAPIAuthorizedAPIEvent) {
  const parseResult = WebPushUnsubscribeRequestSchema.safeParse(event)
  if (!parseResult.success) {
    return processParseFailure(parseResult)
  }

  await deregisterSubscription(appState, userIdFromApiEvent(parseResult.data), parseResult.data.body.endpoint)
  return jsonOkResult({ message: 'successfully unsubscribed' })
}

export async function handleWebPushTest(appState: AppState, event: CicadaAPIAuthorizedAPIEvent) {
  const parseResult = APIEventSchema.safeParse(event)
  if (!parseResult.success) {
    return processParseFailure(parseResult)
  }

  await sendToEventBridge(
    appState,
    EVENTBRIDGE_DETAIL_TYPES.WEB_PUSH_TEST,
    githubUserSummaryFromEvent(parseResult.data)
  )
  return jsonOkResult({ message: 'Web Push Test OK' })
}

function processParseFailure(parseResult: unknown) {
  logger.warn('WebPush subscribe failed', { parseResult })
  return withJSONContentType(responseWithStatusCode(400, { message: 'Invalid request' }))
}
