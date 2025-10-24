import type { PushSubscription } from 'web-push'
import { GitHubUserSummary } from '../../types/GitHubTypes.js'
import { isGitHubUserSummary } from '../../types/GitHubTypeChecks.js'

export interface WebPushSubscription extends PushSubscription, GitHubUserSummary {}

export function isWebPushSubscription(x: unknown): x is WebPushSubscription {
  const candidate = x as WebPushSubscription
  return (
    isGitHubUserSummary(x) &&
    candidate.endpoint !== undefined &&
    candidate.keys !== undefined &&
    candidate.keys.p256dh !== undefined &&
    candidate.keys.auth !== undefined
  )
}
