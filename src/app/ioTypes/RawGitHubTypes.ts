import {
  RawGitHubAccountIdSchema,
  RawGithubAPIPushEventEventCommitSchema,
  RawGithubAPIPushEventEventSchema,
  RawGitHubAppIdSchema,
  RawGithubEventSchema,
  RawGitHubInstallationIdSchema,
  RawGithubInstallationSchema,
  RawGitHubRepoIdSchema,
  RawGithubRepoSchema,
  RawGithubTargetTypeSchema,
  RawGitHubUserIdSchema,
  RawGithubUserSchema,
  RawGithubWebhookPushCommitSchema,
  RawGithubWebhookPushSchema,
  RawGitHubWorkflowIdSchema,
  RawGithubWorkflowRunEventSchema,
  RawGithubWorkflowSchema
} from './RawGitHubSchemas.js'
import { z } from 'zod'

export type RawGitHubAppId = z.infer<typeof RawGitHubAppIdSchema>
export type RawGitHubInstallationId = z.infer<typeof RawGitHubInstallationIdSchema>
export type RawGitHubAccountId = z.infer<typeof RawGitHubAccountIdSchema>
export type RawGitHubUserId = z.infer<typeof RawGitHubUserIdSchema>
export type RawGitHubRepoId = z.infer<typeof RawGitHubRepoIdSchema>
export type RawGitHubWorkflowId = z.infer<typeof RawGitHubWorkflowIdSchema>
export type RawGitHubTargetType = z.infer<typeof RawGithubTargetTypeSchema>
export type RawGithubInstallation = z.infer<typeof RawGithubInstallationSchema>
export type RawGithubUser = z.infer<typeof RawGithubUserSchema>
export type RawGithubRepo = z.infer<typeof RawGithubRepoSchema>
export type RawGithubWorkflow = z.infer<typeof RawGithubWorkflowSchema>
export type RawGithubEvent = z.infer<typeof RawGithubEventSchema>
export type RawGithubAPIPushEventEventCommit = z.infer<typeof RawGithubAPIPushEventEventCommitSchema>
export type RawGithubAPIPushEventEvent = z.infer<typeof RawGithubAPIPushEventEventSchema>
export type RawGithubWebhookPushCommit = z.infer<typeof RawGithubWebhookPushCommitSchema>
export type RawGithubWebhookPush = z.infer<typeof RawGithubWebhookPushSchema>
export type RawGithubWorkflowRunEvent = z.infer<typeof RawGithubWorkflowRunEventSchema>
