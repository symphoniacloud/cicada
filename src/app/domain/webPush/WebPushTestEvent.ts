export type WebPushTestEvent = { userId: number }

export function isWebPushTestEvent(x: unknown): x is WebPushTestEvent {
  return (x as WebPushTestEvent).userId !== undefined
}
