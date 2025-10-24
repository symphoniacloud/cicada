import * as z from 'zod'

export const GITHUB_ACCOUNT_ID_PREFIX = `GHAccount`
export const GitHubAccountIdSchema = z
  .templateLiteral([z.literal(GITHUB_ACCOUNT_ID_PREFIX), z.number().int().nonnegative()])
  .readonly()

export const GITHUB_REPO_ID_PREFIX = `GHRepo`
export const GitHubRepoIdSchema = z
  .templateLiteral([z.literal(GITHUB_REPO_ID_PREFIX), z.number().int().nonnegative()])
  .readonly()

export const GITHUB_WORKFLOW_ID_PREFIX = `GHWorkflow`
export const GitHubWorkflowIdSchema = z
  .templateLiteral([z.literal(GITHUB_WORKFLOW_ID_PREFIX), z.number().int().nonnegative()])
  .readonly()

export const GITHUB_USER_ID_PREFIX = `GHUser`
export const GitHubUserIdSchema = z
  .templateLiteral([z.literal(GITHUB_USER_ID_PREFIX), z.number().int().nonnegative()])
  .readonly()

export const GITHUB_WORKFLOW_RUN_ID_PREFIX = `GHWorkflowRun`
export const GitHubWorkflowRunIdSchema = z
  .templateLiteral([z.literal(GITHUB_WORKFLOW_RUN_ID_PREFIX), z.number().int().nonnegative()])
  .readonly()

export const GITHUB_APP_ID_PREFIX = `GHApp`
export const GitHubAppIdSchema = z
  .templateLiteral([z.literal(GITHUB_APP_ID_PREFIX), z.number().int().nonnegative()])
  .readonly()

export const GITHUB_INSTALLATION_ID_PREFIX = `GHInstallation`
export const GitHubInstallationIdSchema = z
  .templateLiteral([z.literal(GITHUB_INSTALLATION_ID_PREFIX), z.number().int().nonnegative()])
  .readonly()

// Not putting .readonly() on object schemas since if we do I can't currently extend() them

export const GitHubAccountKeySchema = z.object({
  accountId: GitHubAccountIdSchema
})

export const GitHubRepoKeySchema = GitHubAccountKeySchema.extend({
  repoId: GitHubRepoIdSchema
})

export const GitHubWorkflowKeySchema = GitHubRepoKeySchema.extend({
  workflowId: GitHubWorkflowIdSchema
})

export const GitHubUserKeySchema = z.object({
  userId: GitHubUserIdSchema
})
