import * as z from 'zod'
import {
  GitHubAccountIdSchema,
  GitHubRepoIdSchema,
  GitHubUserIdSchema,
  GitHubWorkflowIdSchema
} from './GitHubIdTypes.js'

// -- Account
export const GitHubAccountKeySchema = z.object({
  accountId: GitHubAccountIdSchema
})

export type GitHubAccountKey = z.infer<typeof GitHubAccountKeySchema>

export function isGitHubAccountKey(x: unknown): x is GitHubAccountKey {
  return GitHubAccountKeySchema.safeParse(x).success
}

// -- Repo

export const GitHubRepoKeySchema = GitHubAccountKeySchema.extend({
  repoId: GitHubRepoIdSchema
})

export type GitHubRepoKey = z.infer<typeof GitHubRepoKeySchema>

export function isGitHubRepoKey(x: unknown): x is GitHubRepoKey {
  return GitHubRepoKeySchema.safeParse(x).success
}

// -- Workflow

export const GitHubWorkflowKeySchema = GitHubRepoKeySchema.extend({
  workflowId: GitHubWorkflowIdSchema
})

export type GitHubWorkflowKey = z.infer<typeof GitHubWorkflowKeySchema>

export function isGitHubWorkflowKey(x: unknown): x is GitHubWorkflowKey {
  return GitHubWorkflowKeySchema.safeParse(x).success
}

// -- User

export const GitHubUserKeySchema = z.object({
  userId: GitHubUserIdSchema
})

export type GitHubUserKey = z.infer<typeof GitHubUserKeySchema>

export function isGitHubUserKey(x: unknown): x is GitHubUserKey {
  return GitHubUserKeySchema.safeParse(x).success
}
