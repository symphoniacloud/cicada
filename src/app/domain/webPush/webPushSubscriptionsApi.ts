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
import { failedWithResult, Result, successWith } from '../../util/structuredResult.js'
import { z } from 'zod'
import { APIGatewayProxyResult } from 'aws-lambda'

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
  const parseResult = parseEventWithSchema(event, WebPushSubscribeRequestSchema)
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
  const parseResult = parseEventWithSchema(event, WebPushUnsubscribeRequestSchema)
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
  const parseResult = parseEventWithSchema(event, APIEventSchema)
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

function parseEventWithSchema<TSchema extends z.ZodType>(
  event: CicadaAPIAuthorizedAPIEvent,
  schema: TSchema
): Result<z.infer<TSchema>, APIGatewayProxyResult> {
  const parseResult = schema.safeParse(event)
  if (!parseResult.success) {
    logger.warn('Request parsing failed', { parseResult })
    return failedWithResult(
      'Parse failure',
      withJSONContentType(responseWithStatusCode(400, { message: 'Invalid request' }))
    )
  }
  return successWith(parseResult.data)
}
