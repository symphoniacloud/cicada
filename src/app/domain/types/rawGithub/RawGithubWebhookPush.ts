import { z } from 'zod'
import { logger } from '../../../util/logging.js'

export const RawGithubWebhookPushCommitSchema = z.object({
  id: z.string(),
  message: z.string(),
  distinct: z.boolean(),
  author: z.object({
    email: z.string(),
    name: z.string(),
    username: z.string()
  }),
  timestamp: z.string()
})

export type RawGithubWebhookPushCommit = z.infer<typeof RawGithubWebhookPushCommitSchema>

export const RawGithubWebhookPushSchema = z.object({
  ref: z.string(),
  before: z.string(),
  repository: z.object({
    id: z.number(),
    name: z.string(),
    html_url: z.string(),
    owner: z.object({
      name: z.string(),
      id: z.number(),
      type: z.string()
    })
  }),
  sender: z.object({
    id: z.number(),
    login: z.string(),
    avatar_url: z.string()
  }),
  commits: z.array(RawGithubWebhookPushCommitSchema).nonempty()
})

export type RawGithubWebhookPush = z.infer<typeof RawGithubWebhookPushSchema>

export function isRawGithubWebhookPush(x: unknown): x is RawGithubWebhookPush {
  const result = RawGithubWebhookPushSchema.safeParse(x)
  if (!result.success) {
    logger.error('Unexpected structure for RawGithubWebhookPush', { event: x, error: result.error })
  }
  return result.success
}

export function isRawGithubWebhookPushCommit(x: unknown): x is RawGithubWebhookPushCommit {
  return RawGithubWebhookPushCommitSchema.safeParse(x).success
}
