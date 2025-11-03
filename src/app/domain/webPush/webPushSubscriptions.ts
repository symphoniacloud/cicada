import { AppState } from '../../environment/AppState.js'
import { logger } from '../../util/logging.js'
import {
  deleteWebPushSubscription,
  putWebPushSubscription
} from '../entityStore/entities/WebPushSubscriptionEntity.js'

import { GitHubUserId } from '../../ioTypes/GitHubTypes.js'
import { WebPushSubscription } from '../../ioTypes/WebPushSchemasAndTypes.js'

export async function registerSubscription(appState: AppState, subscription: WebPushSubscription) {
  logger.debug(`Registering new web push subscription for ${subscription.userId}`)
  await putWebPushSubscription(appState.entityStore, subscription)
}

export async function deregisterSubscription(appState: AppState, userId: GitHubUserId, endpoint: string) {
  logger.debug(`Deregistering web push subscription for ${userId}`)
  await deleteWebPushSubscription(appState.entityStore, userId, endpoint)
}
