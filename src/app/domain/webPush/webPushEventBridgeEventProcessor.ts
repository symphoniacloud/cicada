import { AppState } from '../../environment/AppState.js'
import { EventBridgeEvent } from 'aws-lambda'
import { handleNewPush, handleNewWorkflowRunEvent } from './cicadaEventWebPushPublisher.js'
import { handleWebPushTest } from './webPushUserTest.js'
import {
  EVENTBRIDGE_DETAIL_TYPE_GITHUB_NEW_PUSH,
  EVENTBRIDGE_DETAIL_TYPE_GITHUB_NEW_WORKFLOW_RUN_EVENT,
  EVENTBRIDGE_DETAIL_TYPE_WEB_PUSH_TEST,
  WebPushEventBridgeDetailType,
  WebpushEventBridgeDetailTypeSchema
} from '../../../multipleContexts/eventBridgeSchemas.js'

export async function processEventBridgeWebPushEvent(
  appState: AppState,
  event: EventBridgeEvent<string, unknown>
) {
  const detailType = WebpushEventBridgeDetailTypeSchema.parse(event['detail-type'])
  await webPushEventProcessors[detailType](appState, event.detail)
}

const webPushEventProcessors: Record<WebPushEventBridgeDetailType, WebPushEventProcessor> = {
  [EVENTBRIDGE_DETAIL_TYPE_GITHUB_NEW_WORKFLOW_RUN_EVENT]: handleNewWorkflowRunEvent,
  [EVENTBRIDGE_DETAIL_TYPE_GITHUB_NEW_PUSH]: handleNewPush,
  [EVENTBRIDGE_DETAIL_TYPE_WEB_PUSH_TEST]: handleWebPushTest
}

type WebPushEventProcessor = (appState: AppState, eventDetail: unknown) => Promise<void>
