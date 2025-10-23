import { GitHubUserId } from '../../types/GitHubIdTypes.js'

export type WebPushTestEvent = { userId: GitHubUserId }

export function isWebPushTestEvent(x: unknown): x is WebPushTestEvent {
  return (x as WebPushTestEvent).userId !== undefined
}
