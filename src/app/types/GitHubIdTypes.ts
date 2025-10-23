import * as z from 'zod'

// -- Account
export const GITHUB_ACCOUNT_ID_PREFIX = `GHAccount`
export const GitHubAccountIdSchema = z
  .templateLiteral([z.literal(GITHUB_ACCOUNT_ID_PREFIX), z.number().int().nonnegative()])
  .readonly()
export type GitHubAccountId = z.infer<typeof GitHubAccountIdSchema>

export function isGitHubAccountId(x: unknown): x is GitHubAccountId {
  return GitHubAccountIdSchema.safeParse(x).success
}

// -- Repo
export const GITHUB_REPO_ID_PREFIX = `GHRepo`

export const GitHubRepoIdSchema = z
  .templateLiteral([z.literal(GITHUB_REPO_ID_PREFIX), z.number().int().nonnegative()])
  .readonly()

export type GitHubRepoId = z.infer<typeof GitHubRepoIdSchema>

export function isGitHubRepoId(x: unknown): x is GitHubRepoId {
  return GitHubRepoIdSchema.safeParse(x).success
}

// -- Workflow
export const GITHUB_WORKFLOW_ID_PREFIX = `GHWorkflow`

export const GitHubWorkflowIdSchema = z
  .templateLiteral([z.literal(GITHUB_WORKFLOW_ID_PREFIX), z.number().int().nonnegative()])
  .readonly()

export type GitHubWorkflowId = z.infer<typeof GitHubWorkflowIdSchema>

export function isGitHubWorkflowId(x: unknown): x is GitHubWorkflowId {
  return GitHubWorkflowIdSchema.safeParse(x).success
}
