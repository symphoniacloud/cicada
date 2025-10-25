import { z } from 'zod'

export const RawGithubEventSchema = z.object({
  id: z.string(),
  type: z.string().nullable()
})

export type RawGithubEvent = z.infer<typeof RawGithubEventSchema>
