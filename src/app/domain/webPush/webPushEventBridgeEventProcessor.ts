import { AppState } from '../../environment/AppState.js'
import { handleNewPush, handleNewWorkflowRunEvent } from './cicadaEventWebPushPublisher.js'
import {
  EVENTBRIDGE_DETAIL_TYPE_GITHUB_NEW_PUSH,
  EVENTBRIDGE_DETAIL_TYPE_GITHUB_NEW_WORKFLOW_RUN_EVENT,
  EVENTBRIDGE_DETAIL_TYPE_WEB_PUSH_TEST
} from '../../../multipleContexts/eventBridgeSchemas.js'
import {
  WebPushEventBridgeEventSchema,
  WebPushTestEventBridgeDetail
} from '../../ioTypes/EventBridgeTypes.js'
import { publishToSubscriptionsForUser } from './webPushPublisher.js'
import { safeParseWithSchema } from '../../ioTypes/zodUtil.js'
import { isFailure } from '../../util/structuredResult.js'

export async function processEventBridgeWebPushEvent(appState: AppState, event: unknown) {
  const parsedResult = safeParseWithSchema(WebPushEventBridgeEventSchema, event)
  if (isFailure(parsedResult)) return
  const parsed = parsedResult.result

  switch (parsed['detail-type']) {
    case EVENTBRIDGE_DETAIL_TYPE_GITHUB_NEW_WORKFLOW_RUN_EVENT:
      return await handleNewWorkflowRunEvent(appState, parsed.detail)
    case EVENTBRIDGE_DETAIL_TYPE_GITHUB_NEW_PUSH:
      return await handleNewPush(appState, parsed.detail)
    case EVENTBRIDGE_DETAIL_TYPE_WEB_PUSH_TEST:
      return await handleWebPushTest(appState, parsed.detail)
  }
}

export async function handleWebPushTest(appState: AppState, eventDetail: WebPushTestEventBridgeDetail) {
  await publishToSubscriptionsForUser(appState, eventDetail.data.userId, {
    title: '✅ Web Push Test',
    body: `This is a test for push notifications from Cicada`,
    data: {
      url: `https://${await appState.config.webHostname()}`
    }
  })
}
