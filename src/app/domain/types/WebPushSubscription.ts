import type { PushSubscription } from 'web-push'
import { GithubUserSummary, isGithubUserSummary } from './GithubSummaries.js'

export interface WebPushSubscription extends PushSubscription, GithubUserSummary {}

export function isWebPushSubscription(x: unknown): x is WebPushSubscription {
  const candidate = x as WebPushSubscription
  return (
    isGithubUserSummary(x) &&
    candidate.endpoint !== undefined &&
    candidate.keys !== undefined &&
    candidate.keys.p256dh !== undefined &&
    candidate.keys.auth !== undefined
  )
}
