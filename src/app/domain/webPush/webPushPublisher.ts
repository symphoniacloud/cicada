import { AppState } from '../../environment/AppState'
import { CicadaWebNotification } from '../../outboundInterfaces/webPushWrapper'
import { getAllSubscriptionsForUser } from './webPushSubscriptions'
import { WebPushSubscription } from '../types/WebPushSubscription'

// TOEventually - consider parallel processing
export async function publishToSubscriptionsForUsers(
  appState: AppState,
  userIds: number[],
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
  userId: number,
  notification: CicadaWebNotification
) {
  for (const subscription of await getAllSubscriptionsForUser(appState, userId)) {
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
