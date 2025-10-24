import * as z from 'zod'
import {
  GitHubAccountIdSchema,
  GitHubAppIdSchema,
  GitHubInstallationIdSchema,
  GitHubRepoIdSchema,
  GitHubUserIdSchema,
  GitHubWorkflowIdSchema,
  GitHubWorkflowRunIdSchema
} from './schemas/GitHubSchemas.js'

export type GitHubAccountId = z.infer<typeof GitHubAccountIdSchema>

export function isGitHubAccountId(x: unknown): x is GitHubAccountId {
  return GitHubAccountIdSchema.safeParse(x).success
}

export type GitHubRepoId = z.infer<typeof GitHubRepoIdSchema>

export function isGitHubRepoId(x: unknown): x is GitHubRepoId {
  return GitHubRepoIdSchema.safeParse(x).success
}

export type GitHubWorkflowId = z.infer<typeof GitHubWorkflowIdSchema>

export function isGitHubWorkflowId(x: unknown): x is GitHubWorkflowId {
  return GitHubWorkflowIdSchema.safeParse(x).success
}

export type GitHubUserId = z.infer<typeof GitHubUserIdSchema>

export function isGitHubUserId(x: unknown): x is GitHubUserId {
  return GitHubUserIdSchema.safeParse(x).success
}

export type GitHubWorkflowRunId = z.infer<typeof GitHubWorkflowRunIdSchema>

export function isGitHubWorkflowRunId(x: unknown): x is GitHubWorkflowRunId {
  return GitHubWorkflowRunIdSchema.safeParse(x).success
}

export type GitHubAppId = z.infer<typeof GitHubAppIdSchema>

export function isGitHubAppId(x: unknown): x is GitHubAppId {
  return GitHubAppIdSchema.safeParse(x).success
}

export type GitHubInstallationId = z.infer<typeof GitHubInstallationIdSchema>

export function isGitHubInstallationId(x: unknown): x is GitHubInstallationId {
  return GitHubInstallationIdSchema.safeParse(x).success
}
