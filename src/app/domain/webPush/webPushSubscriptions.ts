import { AppState } from '../../environment/AppState'
import { logger } from '../../util/logging'
import { isWebPushSubscription, WebPushSubscription } from '../types/WebPushSubscription'
import { WebPushSubscriptionEntity } from '../entityStore/entities/WebPushSubscriptionEntity'
import { emptySuccess, failedWith } from '../../util/structuredResult'
import { GithubUserId } from '../types/GithubUserId'

export async function registerSubscription(
  appState: AppState,
  userId: GithubUserId,
  username: string,
  rawSubscription: string
) {
  logger.debug(`Registering new web push subscription for ${userId}`)
  const webPushSubscription: WebPushSubscription = {
    username,
    userId,
    ...JSON.parse(rawSubscription)
  }
  if (!isWebPushSubscription(webPushSubscription)) {
    logger.warn('Received invalid web push subscription', { rawSubscription })
    return failedWith('invalid event format')
  }

  await webPushStore(appState).put(webPushSubscription)
  return emptySuccess
}

export async function deregisterSubscription(
  appState: AppState,
  userId: GithubUserId,
  rawSubscription: string
) {
  logger.debug(`Deregistering web push subscription for ${userId}`)
  const endpoint = JSON.parse(rawSubscription)?.endpoint
  if (!(typeof endpoint === 'string')) {
    logger.warn('Received invalid web push unsubscription', { rawSubscription })
    return failedWith('invalid event format')
  }
  await webPushStore(appState).delete({
    userId,
    endpoint
  })
  return emptySuccess
}

export async function getAllSubscriptionsForUser(appState: AppState, userId: GithubUserId) {
  return await webPushStore(appState).queryAllByPk({ userId })
}

function webPushStore(appState: AppState) {
  return appState.entityStore.for(WebPushSubscriptionEntity)
}
