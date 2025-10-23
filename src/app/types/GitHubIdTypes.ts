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

// -- User

export const GITHUB_USER_ID_PREFIX = `GHUser`

export const GitHubUserIdSchema = z
  .templateLiteral([z.literal(GITHUB_USER_ID_PREFIX), z.number().int().nonnegative()])
  .readonly()

export type GitHubUserId = z.infer<typeof GitHubUserIdSchema>

export function isGitHubUserId(x: unknown): x is GitHubUserId {
  return GitHubUserIdSchema.safeParse(x).success
}

// -- Workflow Run

export const GITHUB_WORKFLOW_RUN_ID_PREFIX = `GHWorkflowRun`

export const GitHubWorkflowRunIdSchema = z
  .templateLiteral([z.literal(GITHUB_WORKFLOW_RUN_ID_PREFIX), z.number().int().nonnegative()])
  .readonly()

export type GitHubWorkflowRunId = z.infer<typeof GitHubWorkflowRunIdSchema>

export function isGitHubWorkflowRunId(x: unknown): x is GitHubWorkflowRunId {
  return GitHubWorkflowRunIdSchema.safeParse(x).success
}

// -- App

export const GITHUB_APP_ID_PREFIX = `GHApp`

export const GitHubAppIdSchema = z
  .templateLiteral([z.literal(GITHUB_APP_ID_PREFIX), z.number().int().nonnegative()])
  .readonly()

export type GitHubAppId = z.infer<typeof GitHubAppIdSchema>

export function isGitHubAppId(x: unknown): x is GitHubAppId {
  return GitHubAppIdSchema.safeParse(x).success
}
