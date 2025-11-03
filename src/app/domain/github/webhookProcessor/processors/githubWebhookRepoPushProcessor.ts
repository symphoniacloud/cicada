import { WebhookProcessor } from '../WebhookProcessor.js'
import { AppState } from '../../../../environment/AppState.js'
import { processPushes } from '../../githubPush.js'
import { logger } from '../../../../util/logging.js'
import { fromRawGithubWebhookPush, isRawGithubWebhookPush } from '../../../types/fromRawGitHub.js'

export const githubWebhookRepoPushProcessor: WebhookProcessor = async (
  appState: AppState,
  body: string
): Promise<void> => {
  const rawParsed = JSON.parse(body)
  if (!isRawGithubWebhookPush(rawParsed)) {
    logger.warn('Unexpected content for webhook push event', { event: rawParsed })
    return
  }

  const parsed = fromRawGithubWebhookPush(rawParsed)
  if (!parsed) {
    return
  }
  await processPushes(appState, [parsed], true)
}
