import { z } from 'zod'

// There's a lot more actually on here
export const RawGithubInstallationSchema = z.object({
  id: z.number(),
  account: z.object({
    login: z.string(),
    id: z.number()
  }),
  target_type: z.string(),
  app_id: z.number(),
  app_slug: z.string()
})

export type RawGithubInstallation = z.infer<typeof RawGithubInstallationSchema>
