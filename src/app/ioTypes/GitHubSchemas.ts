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

export const GitHubAccountSummarySchema = z
  .object({
    ...GitHubAccountKeySchema.unwrap().shape,
    accountName: z.string(),
    accountType: GitHubAccountTypeSchema
  })
  .readonly()

export const GitHubRepoSummarySchema = z
  .object({
    ...GitHubRepoKeySchema.unwrap().shape,
    ...GitHubAccountSummarySchema.unwrap().shape,
    repoName: z.string()
  })
  .readonly()

export const GitHubWorkflowSummarySchema = z
  .object({
    ...GitHubWorkflowKeySchema.unwrap().shape,
    ...GitHubRepoSummarySchema.unwrap().shape,
    workflowName: z.string()
  })
  .readonly()

export const GitHubUserSummarySchema = z
  .object({
    ...GitHubUserKeySchema.unwrap().shape,
    userName: z.string()
  })
  .readonly()

export const GitHubAccountMembershipSchema = z.object({
  userId: GitHubUserIdSchema,
  accountId: GitHubAccountIdSchema
})

export const GitHubInstallationSchema = z
  .object({
    ...GitHubAccountSummarySchema.unwrap().shape,
    installationId: GitHubInstallationIdSchema,
    appId: GitHubAppIdSchema,
    appSlug: z.string()
  })
  .readonly()

export const GitHubPublicAccountSchema = z
  .object({
    ...GitHubAccountSummarySchema.unwrap().shape,
    installationAccountId: GitHubAccountIdSchema
  })
  .readonly()

export const GitHubUserSchema = z
  .object({
    ...GitHubUserSummarySchema.unwrap().shape,
    avatarUrl: z.string(),
    htmlUrl: z.string(),
    url: z.string()
  })
  .readonly()

export const GitHubUserTokenSchema = z
  .object({
    ...GitHubUserSummarySchema.unwrap().shape,
    token: z.string(),
    nextCheckTime: z.int().positive()
  })
  .readonly()

export const GitHubRepoSchema = z
  .object({
    ...GitHubRepoSummarySchema.unwrap().shape,
    fullName: z.string(),
    private: z.boolean(),
    htmlUrl: z.string(),
    description: z.string(),
    fork: z.boolean(),
    url: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    pushedAt: z.string(),
    homepage: z.string(),
    archived: z.boolean(),
    disabled: z.boolean(),
    visibility: z.string(),
    defaultBranch: z.string()
  })
  .readonly()

export const GitHubWorkflowSchema = z
  .object({
    ...GitHubWorkflowSummarySchema.unwrap().shape,
    workflowPath: z.string(),
    workflowState: z.string(),
    workflowUrl: z.string(),
    workflowHtmlUrl: z.string(),
    workflowBadgeUrl: z.string(),
    workflowCreatedAt: z.string(),
    workflowUpdatedAt: z.string()
  })
  .readonly()

export const GitHubWorkflowRunEventActorSchema = z
  .object({
    ...GitHubUserSummarySchema.unwrap().shape,
    avatarUrl: z.string(),
    htmlUrl: z.string()
  })
  .readonly()

export const GitHubWorkflowRunEventSchema = z
  .object({
    ...GitHubWorkflowSummarySchema.unwrap().shape,
    repoHtmlUrl: z.string(),
    workflowRunId: GitHubWorkflowRunIdSchema,
    runNumber: z.int().positive(),
    runAttempt: z.int().positive().optional(),
    displayTitle: z.string(),
    event: z.string(),
    status: z.string().optional(),
    headBranch: z.string().optional(),
    headSha: z.string(),
    conclusion: z.string().optional(),
    runEventCreatedAt: z.string(),
    runEventUpdatedAt: z.string(),
    runStartedAt: z.string().optional(),
    runHtmlUrl: z.string(),
    // TOEventually - what happens here for a manual push? Do we still get an actor?
    actor: GitHubWorkflowRunEventActorSchema.optional()
  })
  .readonly()

export const GitHubPushActorSchema = z
  .object({
    ...GitHubUserSummarySchema.unwrap().shape,
    avatarUrl: z.string()
  })
  .readonly()

export const GitHubPushCommitAuthorSchema = z
  .object({
    email: z.string().optional(),
    name: z.string().optional()
  })
  .readonly()

export const GitHubPushCommitSchema = z
  .object({
    sha: z.string(),
    message: z.string(),
    distinct: z.boolean(),
    author: GitHubPushCommitAuthorSchema.optional()
  })
  .readonly()

// There's no consistent ID between pushes sourced from Webhooks vs Events, so use combination
// of owner, repo, ref, and headSha to create a key
export const GithubPushSchema = z
  .object({
    ...GitHubRepoSummarySchema.unwrap().shape,
    repoUrl: z.string().optional(),
    actor: GitHubPushActorSchema,
    // dateTime isn't guaranteed to be consistent between pushes sourced from Webhooks vs Events
    dateTime: z.string(),
    ref: z.string(),
    before: z.string(),
    headSha: z.string(),
    // Not available from PushEvents on API, but are available from webhook
    commits: z.array(GitHubPushCommitSchema).optional()
  })
  .readonly()
