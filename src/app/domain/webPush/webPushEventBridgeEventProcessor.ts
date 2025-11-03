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
import { logger } from '../../util/logging.js'
import { publishToSubscriptionsForUser } from './webPushPublisher.js'

export async function processEventBridgeWebPushEvent(appState: AppState, event: unknown) {
  const parsedResult = WebPushEventBridgeEventSchema.safeParse(event)
  if (!parsedResult.success) {
    logger.error('Error parsing event for web push from EventBridge', { parsedResult })
    return
  }
  const parsed = parsedResult.data

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
