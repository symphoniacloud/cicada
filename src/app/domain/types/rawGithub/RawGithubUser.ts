import { z } from 'zod'

export const RawGithubUserSchema = z.object({
  login: z.string(),
  id: z.number(),
  avatar_url: z.string(),
  url: z.string(),
  html_url: z.string(),
  type: z.string()
})

export type RawGithubUser = z.infer<typeof RawGithubUserSchema>
