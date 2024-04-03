import { PushSubscription } from 'web-push'

export interface WebPushSubscription extends PushSubscription {
  userId: number
  username: string
}

export function isWebPushSubscription(x: unknown): x is WebPushSubscription {
  const candidate = x as WebPushSubscription
  return (
    candidate.userId !== undefined &&
    candidate.username !== undefined &&
    candidate.endpoint !== undefined &&
    candidate.keys !== undefined &&
    candidate.keys.p256dh !== undefined &&
    candidate.keys.auth !== undefined
  )
}
