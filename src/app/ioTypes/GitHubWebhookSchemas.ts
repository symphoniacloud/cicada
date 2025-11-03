import { JSONFromStringSchema } from './zodUtil.js'
import { z } from 'zod'
import {
  RawGithubInstallationSchema,
  RawGithubWebhookPushSchema,
  RawGithubWorkflowRunEventSchema
} from './RawGitHubSchemas.js'

export const GitHubWebhookInstallationSchema = JSONFromStringSchema.pipe(
  z.object({
    installation: RawGithubInstallationSchema
  })
)

export const GitHubWebhookPushSchema = JSONFromStringSchema.pipe(RawGithubWebhookPushSchema)

export const GitHubWebhookWorkflowRunEventSchema = JSONFromStringSchema.pipe(
  z.object({
    // Would be nice to type this better
    action: z.string(),
    workflow_run: RawGithubWorkflowRunEventSchema
  })
)

// If changing here probably also want to change in github-app-setup.js
// 'installation' is always fired for a GitHub App
export const WebhookTypeSchema = z.literal([
  'installation',
  'meta',
  'organization',
  'push',
  'repository',
  'workflow_job',
  'workflow_run'
])

export type WebhookType = z.infer<typeof WebhookTypeSchema>

// The type this represents is only currently read in code, since we write webhook events to S3
//  in the API Gateway->S3 integration (in CDK)
export const StoredGitHubWebhookEvent = JSONFromStringSchema.pipe(
  z.object({
    'X-Hub-Signature-256': z.string().min(1),
    'X-GitHub-Event': WebhookTypeSchema,
    body: z.string().min(1)
  })
)
