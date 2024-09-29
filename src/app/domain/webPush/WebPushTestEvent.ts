import { GithubUserId } from '../types/GithubUserId'

export type WebPushTestEvent = { userId: GithubUserId }

export function isWebPushTestEvent(x: unknown): x is WebPushTestEvent {
  return (x as WebPushTestEvent).userId !== undefined
}
