import { AppState } from '../../environment/AppState.js'
import { logger } from '../../util/logging.js'
import { publishToSubscriptionsForUser } from './webPushPublisher.js'
import { isCicadaEventBridgeDetail } from '../../outboundInterfaces/eventBridgeBus.js'
import { GitHubUserSummarySchema } from '../../ioTypes/GitHubSchemas.js'
import { EVENTBRIDGE_DETAIL_TYPE_WEB_PUSH_TEST } from '../../../multipleContexts/eventBridgeSchemas.js'

export async function handleWebPushTest(appState: AppState, eventDetail: unknown) {
  // TODO - move zod throughout EventBridge event parsing
  if (
    !isCicadaEventBridgeDetail(eventDetail) ||
    !GitHubUserSummarySchema.safeParse(eventDetail.data).success
  ) {
    logger.error(
      `Event detail for detail-type ${EVENTBRIDGE_DETAIL_TYPE_WEB_PUSH_TEST} was not of expected format`,
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
