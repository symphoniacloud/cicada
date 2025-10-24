import * as z from 'zod'

import {
  GitHubAccountIdSchema,
  GitHubAccountKeySchema,
  GitHubAccountMembershipSchema,
  GitHubAppIdSchema,
  GitHubInstallationIdSchema,
  GitHubRepoIdSchema,
  GitHubRepoKeySchema,
  GitHubUserIdSchema,
  GitHubUserKeySchema,
  GitHubWorkflowIdSchema,
  GitHubWorkflowKeySchema,
  GitHubWorkflowRunIdSchema
} from './schemas/GitHubSchemas.js'

export type GitHubAccountId = z.infer<typeof GitHubAccountIdSchema>

export type GitHubRepoId = z.infer<typeof GitHubRepoIdSchema>

export type GitHubWorkflowId = z.infer<typeof GitHubWorkflowIdSchema>

export type GitHubUserId = z.infer<typeof GitHubUserIdSchema>

export type GitHubWorkflowRunId = z.infer<typeof GitHubWorkflowRunIdSchema>

export type GitHubAppId = z.infer<typeof GitHubAppIdSchema>

export type GitHubInstallationId = z.infer<typeof GitHubInstallationIdSchema>

export type GitHubAccountKey = z.infer<typeof GitHubAccountKeySchema>

export type GitHubRepoKey = z.infer<typeof GitHubRepoKeySchema>

export type GitHubWorkflowKey = z.infer<typeof GitHubWorkflowKeySchema>

export type GitHubUserKey = z.infer<typeof GitHubUserKeySchema>

export type GitHubAccountMembership = z.infer<typeof GitHubAccountMembershipSchema>
