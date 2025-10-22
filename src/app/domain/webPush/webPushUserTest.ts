import { AppState } from '../../environment/AppState.js'
import { logger } from '../../util/logging.js'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../multipleContexts/eventBridge.js'
import { publishToSubscriptionsForUser } from './webPushPublisher.js'
import { isWebPushTestEvent } from './WebPushTestEvent.js'
import { isCicadaEventBridgeDetail } from '../../outboundInterfaces/eventBridgeBus.js'

export async function handleWebPushTest(appState: AppState, eventDetail: unknown) {
  if (!isCicadaEventBridgeDetail(eventDetail) || !isWebPushTestEvent(eventDetail.data)) {
    logger.error(
      `Event detail for detail-type ${EVENTBRIDGE_DETAIL_TYPES.WEB_PUSH_TEST} was not of expected format`,
      { eventDetail }
    )
    return
  }
  await publishToSubscriptionsForUser(appState, eventDetail.data.userId, {
    title: '✅ Web Push Test',
    body: `This is a test for push notifications from Cicada`,
    data: {
      url: `https://${await appState.config.webHostname()}`
    }
  })
}
