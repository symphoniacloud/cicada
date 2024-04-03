import { WebhookProcessor } from '../WebhookProcessor'
import { AppState } from '../../../../environment/AppState'
import { fromRawGithubWebhookPush } from '../../../types/GithubPush'
import { isRawGithubWebhookPush } from '../../../types/rawGithub/RawGithubWebhookPush'
import { processPushes } from '../../githubPush'
import { logger } from '../../../../util/logging'

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
