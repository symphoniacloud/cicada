import { GitHubUserId } from '../../types/GitHubTypes.js'

export type WebPushTestEvent = { userId: GitHubUserId }

export function isWebPushTestEvent(x: unknown): x is WebPushTestEvent {
  return (x as WebPushTestEvent).userId !== undefined
}
