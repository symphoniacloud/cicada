import * as webPush from 'web-push'
import { PushSubscription } from 'web-push'
import { logger } from '../util/logging.js'
import { WebPushVapidConfig } from '../environment/config.js'

export interface CicadaWebNotification {
  title: string
  body: string
  data: { url: string }
}

export interface WebPushWrapper {
  publishNotification(subscription: PushSubscription, notification: CicadaWebNotification): Promise<void>
}

export function realWebPushWrapper(config: WebPushVapidConfig): WebPushWrapper {
  async function publish(subscription: PushSubscription, notification: string) {
    logger.debug('attempting to push notification', { subscription, notification })

    const response = await webPush.sendNotification(subscription, notification, {
      TTL: 86400, // 1 day, in seconds
      vapidDetails: config
    })
    logger.info('Web Push Response', { response })
  }

  return {
    async publishNotification(
      subscription: PushSubscription,
      notification: CicadaWebNotification
    ): Promise<void> {
      await publish(subscription, JSON.stringify(notification))
    }
  }
}
