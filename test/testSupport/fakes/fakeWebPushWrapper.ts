import { CicadaWebNotification, WebPushWrapper } from '../../../src/app/outboundInterfaces/webPushWrapper'
import deepEqual from 'deep-equal'
import { PushSubscription } from 'web-push'

export class FakeWebPushWrapper implements WebPushWrapper {
  public publishedNotifications: {
    subscription: PushSubscription
    notifications: CicadaWebNotification[]
  }[] = []

  public notificationsForSubscription(subscription: PushSubscription): CicadaWebNotification[] {
    const existingSubscription = this.publishedNotifications.find((x) =>
      deepEqual(x.subscription, subscription)
    )
    if (existingSubscription) {
      return existingSubscription.notifications
    } else {
      const newSubscriptionNotifications: CicadaWebNotification[] = []
      this.publishedNotifications.push({ subscription, notifications: newSubscriptionNotifications })
      return newSubscriptionNotifications
    }
  }

  async publishNotification(
    subscription: PushSubscription,
    notification: CicadaWebNotification
  ): Promise<void> {
    this.notificationsForSubscription(subscription).push(notification)
  }
}
