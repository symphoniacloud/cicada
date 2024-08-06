import { PushSubscription } from 'web-push'
import { GithubUserId, isGithubUserId } from './GithubKeys'
import { isString } from '../../util/types'

export interface WebPushSubscription extends PushSubscription {
  userId: GithubUserId
  username: string
}

export function isWebPushSubscription(x: unknown): x is WebPushSubscription {
  const candidate = x as WebPushSubscription
  return (
    candidate.userId !== undefined &&
    isGithubUserId(candidate.userId) &&
    candidate.username !== undefined &&
    isString(candidate.username) &&
    candidate.endpoint !== undefined &&
    candidate.keys !== undefined &&
    candidate.keys.p256dh !== undefined &&
    candidate.keys.auth !== undefined
  )
}
