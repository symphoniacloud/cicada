import * as z from 'zod'
import { GitHubUserSummarySchema } from './GitHubSchemas.js'
import { APIEventSchema, JSONFromStringSchema } from './zodUtil.js'

// From @types/web-push:
//   https://github.com/DefinitelyTyped/DefinitelyTyped/blob/fd233a5a78badb88dcf588c663fee731a55aae6d/types/web-push/index.d.ts#L206
export const PushSubscriptionSchema = z
  .object({
    endpoint: z.string(),
    expirationTime: z.number().nullable().optional(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string()
    })
  })
  .readonly()

export const WebPushSubscriptionSchema = z.object({
  ...GitHubUserSummarySchema.unwrap().shape,
  ...PushSubscriptionSchema.unwrap().shape
})

export type PushSubscription = z.infer<typeof PushSubscriptionSchema>

export type WebPushSubscription = z.infer<typeof WebPushSubscriptionSchema>

export const WebPushSubscribeRequestSchema = z.object({
  ...APIEventSchema.shape,
  body: JSONFromStringSchema.pipe(PushSubscriptionSchema)
})

export const WebPushUnsubscribeRequestSchema = z.object({
  ...APIEventSchema.shape,
  body: JSONFromStringSchema.pipe(z.object({ endpoint: z.string() }))
})
