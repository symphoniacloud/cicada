import { GithubUserId } from '../types/GithubUserId.js'

export type WebPushTestEvent = { userId: GithubUserId }

export function isWebPushTestEvent(x: unknown): x is WebPushTestEvent {
  return (x as WebPushTestEvent).userId !== undefined
}
