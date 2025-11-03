import { AppState } from '../../../environment/AppState.js'
import { logger } from '../../../util/logging.js'

export type WebhookProcessor = (appState: AppState, body: string) => Promise<void>

export const IGNORE_WEBHOOK_EVENT_PROCESSOR = async () => {
  logger.info('Ignoring webhook event')
}
