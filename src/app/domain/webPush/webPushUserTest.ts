import { AppState } from '../../environment/AppState'
import { logger } from '../../util/logging'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../multipleContexts/eventBridge'
import { publishToSubscriptionsForUser } from './webPushPublisher'
import { isWebPushTestEvent } from './WebPushTestEvent'
import { isCicadaEventBridgeDetail } from '../../outboundInterfaces/eventBridgeBus'

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
