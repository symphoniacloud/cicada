import { AppState } from '../../environment/AppState.js'
import { logger } from '../../util/logging.js'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../multipleContexts/eventBridge.js'
import { publishToSubscriptionsForUser } from './webPushPublisher.js'
import { isCicadaEventBridgeDetail } from '../../outboundInterfaces/eventBridgeBus.js'
import { GitHubUserSummarySchema } from '../../ioTypes/GitHubSchemas.js'

export async function handleWebPushTest(appState: AppState, eventDetail: unknown) {
  // TODO - move zod throughout EventBridge event parsing
  if (
    !isCicadaEventBridgeDetail(eventDetail) ||
    !GitHubUserSummarySchema.safeParse(eventDetail.data).success
  ) {
    logger.error(
      `Event detail for detail-type ${EVENTBRIDGE_DETAIL_TYPES.WEB_PUSH_TEST} was not of expected format`,
      { eventDetail }
    )
    return
  }
  await publishToSubscriptionsForUser(appState, GitHubUserSummarySchema.parse(eventDetail.data).userId, {
    title: '✅ Web Push Test',
    body: `This is a test for push notifications from Cicada`,
    data: {
      url: `https://${await appState.config.webHostname()}`
    }
  })
}
