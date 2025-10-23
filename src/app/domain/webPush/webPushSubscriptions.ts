import { AppState } from '../../environment/AppState.js'
import { logger } from '../../util/logging.js'
import { isWebPushSubscription, WebPushSubscription } from '../types/WebPushSubscription.js'
import { emptySuccess, failedWith } from '../../util/structuredResult.js'
import {
  deleteWebPushSubscription,
  putWebPushSubscription
} from '../entityStore/entities/WebPushSubscriptionEntity.js'
import { GitHubUserId } from '../../types/GitHubIdTypes.js'

export async function registerSubscription(
  appState: AppState,
  userId: GitHubUserId,
  userName: string,
  rawSubscription: string
) {
  logger.debug(`Registering new web push subscription for ${userId}`)
  const webPushSubscription: WebPushSubscription = {
    userName,
    userId,
    ...JSON.parse(rawSubscription)
  }
  if (!isWebPushSubscription(webPushSubscription)) {
    logger.warn('Received invalid web push subscription', { rawSubscription })
    return failedWith('invalid event format')
  }

  await putWebPushSubscription(appState.entityStore, webPushSubscription)
  return emptySuccess
}

export async function deregisterSubscription(
  appState: AppState,
  userId: GitHubUserId,
  rawSubscription: string
) {
  logger.debug(`Deregistering web push subscription for ${userId}`)
  const endpoint = JSON.parse(rawSubscription)?.endpoint
  if (!(typeof endpoint === 'string')) {
    logger.warn('Received invalid web push unsubscription', { rawSubscription })
    return failedWith('invalid event format')
  }
  await deleteWebPushSubscription(appState.entityStore, userId, endpoint)
  return emptySuccess
}
