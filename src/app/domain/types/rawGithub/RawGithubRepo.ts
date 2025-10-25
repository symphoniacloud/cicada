import { z } from 'zod'

export const RawGithubRepoSchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  private: z.boolean(),
  owner: z.object({
    id: z.number(),
    login: z.string(),
    type: z.string()
  }),
  html_url: z.string(),
  description: z.string().nullable(),
  fork: z.boolean(),
  url: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  pushed_at: z.string(),
  homepage: z.string().nullable(),
  archived: z.boolean(),
  disabled: z.boolean(),
  visibility: z.string(),
  default_branch: z.string()
})

export type RawGithubRepo = z.infer<typeof RawGithubRepoSchema>
