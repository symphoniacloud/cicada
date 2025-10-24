import * as z from 'zod'

// Notes:
// - Using .readonly() on types marks the actual inferred types as readonly and freezes after parse
//   at runtime. Which is useful, but means we need to do "unwrap" in a bunch of places
//   (see https://github.com/colinhacks/zod/issues/3577)

// ** IDs
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

// ** Keys

export const GitHubAccountKeySchema = z
  .object({
    accountId: GitHubAccountIdSchema
  })
  .readonly()

export const GitHubRepoKeySchema = z
  .object({
    ...GitHubAccountKeySchema.unwrap().shape,
    repoId: GitHubRepoIdSchema
  })
  .readonly()

export const GitHubWorkflowKeySchema = z
  .object({
    ...GitHubRepoKeySchema.unwrap().shape,
    workflowId: GitHubWorkflowIdSchema
  })
  .readonly()

export const GitHubUserKeySchema = z
  .object({
    userId: GitHubUserIdSchema
  })
  .readonly()

// ** Objects

export const ORGANIZATION_ACCOUNT_TYPE = 'organization'
export const USER_ACCOUNT_TYPE = 'user'

export const GitHubAccountTypeSchema = z.literal([ORGANIZATION_ACCOUNT_TYPE, USER_ACCOUNT_TYPE])

export const GitHubAccountSummarySchema = z.object({
  ...GitHubAccountKeySchema.unwrap().shape,
  accountName: z.string(),
  accountType: GitHubAccountTypeSchema
})

export const GitHubRepoSummarySchema = z.object({
  ...GitHubRepoKeySchema.unwrap().shape,
  ...GitHubAccountSummarySchema.shape,
  repoName: z.string()
})

export const GitHubWorkflowSummarySchema = z.object({
  ...GitHubWorkflowKeySchema.unwrap().shape,
  ...GitHubRepoSummarySchema.shape,
  workflowName: z.string()
})

export const GitHubUserSummarySchema = z.object({
  ...GitHubUserKeySchema.unwrap().shape,
  userName: z.string()
})

export const GitHubAccountMembershipSchema = z.object({
  userId: GitHubUserIdSchema,
  accountId: GitHubAccountIdSchema
})

// export const GitHubInstallationSchema = GithubAccountSummarySchema.extend({
// })
