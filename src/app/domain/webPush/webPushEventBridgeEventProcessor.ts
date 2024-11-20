import { AppState } from '../../environment/AppState'
import { EventBridgeEvent } from 'aws-lambda'
import {
  EVENTBRIDGE_DETAIL_TYPES,
  isWebPushEventBridgeDetailType,
  WebPushEventBridgeDetailType
} from '../../../multipleContexts/eventBridge'
import { logger } from '../../util/logging'
import { handleNewPush, handleNewWorkflowRunEvent } from './cicadaEventWebPushPublisher'
import { handleWebPushTest } from './webPushUserTest'

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
