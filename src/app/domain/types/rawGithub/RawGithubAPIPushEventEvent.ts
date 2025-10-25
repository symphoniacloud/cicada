import { z } from 'zod'
import { RawGithubEventSchema } from './RawGithubEvent.js'
import { logger } from '../../../util/logging.js'
import { isNotNullObject } from '../../../util/types.js'

// Commented fields not currently captured

export const RawGithubAPIPushEventEventCommitSchema = z.object({
  sha: z.string(),
  message: z.string(),
  distinct: z.boolean(),
  author: z.object({
    email: z.string(),
    name: z.string()
  })
})

export type RawGithubAPIPushEventEventCommit = z.infer<typeof RawGithubAPIPushEventEventCommitSchema>

export const RawGithubAPIPushEventEventSchema = RawGithubEventSchema.extend({
  type: z.literal('PushEvent'),
  actor: z.object({
    id: z.number(),
    login: z.string(),
    avatar_url: z.string()
  }),
  repo: z.object({
    id: z.number(),
    name: z.string()
  }),
  created_at: z.string(),
  payload: z.object({
    ref: z.string(),
    before: z.string(),
    commits: z.array(RawGithubAPIPushEventEventCommitSchema)
    // repository_id: number
    // push_id: number
    // size: number
    // distinct_size: number
    // head: string
  })
  // public: boolean
  // org?: {
  //   id: number
  //   login: string
  //   avatar_url: string
  // }
})

export type RawGithubAPIPushEventEvent = z.infer<typeof RawGithubAPIPushEventEventSchema>

// TOEventually - better type checking across these two functions
export function hasTypeForPushEvent(x: unknown): x is { type: 'PushEvent' } {
  return isNotNullObject(x) && 'type' in x && x.type === 'PushEvent'
}

export function isRawGithubPushEventEvent(x: unknown): x is RawGithubAPIPushEventEvent {
  const result = RawGithubAPIPushEventEventSchema.safeParse(x)
  if (!result.success) {
    logger.error('Unexpected structure for RawGithubAPIPushEventEvent', { event: x, error: result.error })
  }
  return result.success
}
