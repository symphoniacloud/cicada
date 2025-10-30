import { z } from 'zod'

export const RawGithubTargetTypeSchema = z.literal(['User', 'Organization'])

export const RawGithubInstallationSchema = z.object({
  id: z.number(),
  account: z.object({
    login: z.string(),
    id: z.number()
  }),
  target_type: RawGithubTargetTypeSchema,
  app_id: z.number(),
  app_slug: z.string()
})
