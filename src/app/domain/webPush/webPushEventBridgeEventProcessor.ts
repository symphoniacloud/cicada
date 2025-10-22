import { AppState } from '../../environment/AppState.js'
import { EventBridgeEvent } from 'aws-lambda'
import {
  EVENTBRIDGE_DETAIL_TYPES,
  isWebPushEventBridgeDetailType,
  WebPushEventBridgeDetailType
} from '../../../multipleContexts/eventBridge.js'
import { logger } from '../../util/logging.js'
import { handleNewPush, handleNewWorkflowRunEvent } from './cicadaEventWebPushPublisher.js'
import { handleWebPushTest } from './webPushUserTest.js'

export async function processEventBridgeWebPushEvent(
  appState: AppState,
  event: EventBridgeEvent<string, unknown>
) {
  const detailType = event['detail-type']
  if (!isWebPushEventBridgeDetailType(detailType)) {
    logger.error(`Unexpected detail type: ${detailType}`)
    return
  }

  await webPushEventProcessors[detailType](appState, event.detail)
}

const webPushEventProcessors: Record<WebPushEventBridgeDetailType, WebPushEventProcessor> = {
  [EVENTBRIDGE_DETAIL_TYPES.GITHUB_NEW_WORKFLOW_RUN_EVENT]: handleNewWorkflowRunEvent,
  [EVENTBRIDGE_DETAIL_TYPES.GITHUB_NEW_PUSH]: handleNewPush,
  [EVENTBRIDGE_DETAIL_TYPES.WEB_PUSH_TEST]: handleWebPushTest
}

type WebPushEventProcessor = (appState: AppState, eventDetail: unknown) => Promise<void>
