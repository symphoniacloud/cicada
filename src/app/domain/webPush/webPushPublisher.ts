import { AppState } from '../../environment/AppState.js'
import { CicadaWebNotification } from '../../outboundInterfaces/webPushWrapper.js'
import { WebPushSubscription } from '../types/WebPushSubscription.js'

import { getAllWebPushSubscriptionsForUser } from '../entityStore/entities/WebPushSubscriptionEntity.js'
import { GitHubUserId } from '../../types/GitHubIdTypes.js'

// TOEventually - consider parallel processing
export async function publishToSubscriptionsForUsers(
  appState: AppState,
  userIds: GitHubUserId[],
  notification: CicadaWebNotification
) {
  for (const userId of userIds) {
    await publishToSubscriptionsForUser(appState, userId, notification)
  }
}

// TOEventually - error handling. Eg delete subscription from DB on failures
// TOEventually - consider parallel processing
export async function publishToSubscriptionsForUser(
  appState: AppState,
  userId: GitHubUserId,
  notification: CicadaWebNotification
) {
  for (const subscription of await getAllWebPushSubscriptionsForUser(appState.entityStore, userId)) {
    await publishToSubscription(appState, subscription, notification)
  }
}

export async function publishToSubscription(
  appState: AppState,
  subscription: WebPushSubscription,
  notification: CicadaWebNotification
) {
  await appState.webPushWrapper.publishNotification(
    {
      endpoint: subscription.endpoint,
      keys: subscription.keys
    },
    notification
  )
}
