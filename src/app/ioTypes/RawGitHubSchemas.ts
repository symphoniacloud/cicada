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

export const RawGithubUserSchema = z.object({
  login: z.string(),
  id: z.number(),
  avatar_url: z.string(),
  url: z.string(),
  html_url: z.string(),
  type: z.string()
})

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

export const RawGithubWorkflowSchema = z.object({
  id: z.number(),
  node_id: z.string(),
  name: z.string(),
  path: z.string(),
  state: z.string(), // Can be [ "active", "deleted", "disabled_fork", "disabled_inactivity", "disabled_manually" ]
  created_at: z.string(),
  updated_at: z.string(),
  url: z.string(),
  html_url: z.string(),
  badge_url: z.string()
})
