// This type is defined partly by the Octokit function actions.listWorkflowRunsForRepo,
// hence things here like fields that are possibly both undefined or null
// For now at least we use the same type here to represent runs events returned via the API **and** sent
// via webhook - that means some fields are missing here that exist in the API events, but not in webhook events
// This is a subset, but we can't infer full type using typescript

import { z } from 'zod'
import { logger } from '../../../util/logging.js'

export const RawGithubWorkflowRunEventSchema = z.object({
  id: z.number(),
  name: z.string().nullable().optional(),
  node_id: z.string(),
  head_branch: z.string().nullable(),
  head_sha: z.string(),
  path: z.string(),
  display_title: z.string(),
  run_number: z.number(),
  event: z.string(),
  status: z.string().nullable(),
  conclusion: z.string().nullable(),
  workflow_id: z.number(),
  html_url: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  run_attempt: z.number().optional(),
  run_started_at: z.string().optional(),
  actor: z
    .object({
      login: z.string(),
      id: z.number(),
      avatar_url: z.string(),
      html_url: z.string()
    })
    .optional(),
  repository: z.object({
    id: z.number(),
    node_id: z.string(),
    name: z.string(),
    html_url: z.string(),
    owner: z.object({
      id: z.number(),
      login: z.string(),
      type: z.string()
    })
  }),
  // "workflow" is in webhook event but not API event
  workflow: z
    .object({
      id: z.number(),
      name: z.string(),
      html_url: z.string(),
      badge_url: z.string()
    })
    .optional()
})

export type RawGithubWorkflowRunEvent = z.infer<typeof RawGithubWorkflowRunEventSchema>

export function isRawGithubWorkflowRunEvent(x: unknown): x is RawGithubWorkflowRunEvent {
  const result = RawGithubWorkflowRunEventSchema.safeParse(x)
  if (!result.success) {
    logger.error('Unexpected structure for RawGithubWorkflowRunEvent', { event: x, error: result.error })
  }
  return result.success
}
