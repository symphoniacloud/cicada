import { z } from 'zod'

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

export type RawGithubWorkflow = z.infer<typeof RawGithubWorkflowSchema>
