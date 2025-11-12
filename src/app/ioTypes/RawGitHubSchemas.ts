import { z } from 'zod'

export const RawGitHubAppIdSchema = z.number()
export const RawGitHubInstallationIdSchema = z.number()
export const RawGitHubAccountIdSchema = z.number()
export const RawGitHubUserIdSchema = z.number()
export const RawGitHubRepoIdSchema = z.number()
export const RawGitHubWorkflowIdSchema = z.number()

export const RawGithubTargetTypeSchema = z.literal(['User', 'Organization'])

export const RawGithubInstallationSchema = z.object({
  id: RawGitHubInstallationIdSchema,
  account: z.object({
    login: z.string(),
    id: RawGitHubAccountIdSchema
  }),
  target_type: RawGithubTargetTypeSchema,
  app_id: RawGitHubAppIdSchema,
  app_slug: z.string()
})

export const RawGithubUserSchema = z.object({
  login: z.string(),
  id: RawGitHubUserIdSchema,
  avatar_url: z.string(),
  url: z.string(),
  html_url: z.string(),
  type: RawGithubTargetTypeSchema
})

export const RawGithubRepoSchema = z.object({
  id: RawGitHubRepoIdSchema,
  name: z.string(),
  full_name: z.string(),
  private: z.boolean(),
  owner: z.object({
    id: RawGitHubAccountIdSchema,
    login: z.string(),
    type: RawGithubTargetTypeSchema
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
  id: RawGitHubWorkflowIdSchema,
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

// This is loose because we want to do a secondary parse later
export const RawGithubEventSchema = z.looseObject({
  id: z.string(),
  type: z.string().nullable()
})

export const RawGithubPushFromApiSchema = z.object({
  ...RawGithubEventSchema.shape,
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
    head: z.string(),
    before: z.string()
    // GitHub no longer provides commits as of October 2025
    // https://github.com/orgs/community/discussions/177111
    // https://github.blog/changelog/2025-08-08-upcoming-changes-to-github-events-api-payloads/
  })
})

export const RawGithubPushFromWebhookCommitSchema = z.object({
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

export const RawGithubPushFromWebhookSchemaWithPossibleNoHead = z.object({
  ref: z.string(),
  before: z.string(),
  repository: z.object({
    id: z.number(),
    name: z.string(),
    html_url: z.string(),
    owner: z.object({
      name: z.string(),
      id: z.number(),
      type: RawGithubTargetTypeSchema
    })
  }),
  sender: z.object({
    id: z.number(),
    login: z.string(),
    avatar_url: z.string()
  }),
  commits: z.array(RawGithubPushFromWebhookCommitSchema).optional(),
  head_commit: RawGithubPushFromWebhookCommitSchema.nullish()
})

export const RawGithubPushFromWebhookSchema = z.object({
  ...RawGithubPushFromWebhookSchemaWithPossibleNoHead.shape,
  head_commit: RawGithubPushFromWebhookCommitSchema
})

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
      type: RawGithubTargetTypeSchema
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
