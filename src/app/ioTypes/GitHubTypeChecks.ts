import {
  GitHubAccountIdSchema,
  GitHubAccountKeySchema,
  GitHubAccountMembershipSchema,
  GitHubAccountTypeSchema,
  GitHubAppIdSchema,
  GitHubInstallationIdSchema,
  GitHubInstallationSchema,
  GitHubPublicAccountSchema,
  GithubPushSchema,
  GitHubRepoIdSchema,
  GitHubRepoSchema,
  GitHubUserIdSchema,
  GitHubUserKeySchema,
  GitHubUserSchema,
  GitHubUserSummarySchema,
  GitHubUserTokenSchema,
  GitHubWorkflowIdSchema,
  GitHubWorkflowRunEventSchema,
  GitHubWorkflowRunIdSchema,
  GitHubWorkflowSchema
} from './GitHubSchemas.js'
import {
  GitHubAccountId,
  GitHubAccountKey,
  GitHubAccountMembership,
  GitHubAccountType,
  GitHubAppId,
  GitHubInstallation,
  GitHubInstallationId,
  GitHubPublicAccount,
  GitHubPush,
  GitHubRepo,
  GitHubRepoId,
  GitHubUser,
  GitHubUserId,
  GitHubUserKey,
  GitHubUserSummary,
  GitHubUserToken,
  GitHubWorkflow,
  GitHubWorkflowId,
  GitHubWorkflowRunEvent,
  GitHubWorkflowRunId
} from './GitHubTypes.js'

// TODO These may be able to mostly go away if we start just using safe parse more

export function isGitHubAccountId(x: unknown): x is GitHubAccountId {
  return GitHubAccountIdSchema.safeParse(x).success
}

export function isGitHubRepoId(x: unknown): x is GitHubRepoId {
  return GitHubRepoIdSchema.safeParse(x).success
}

export function isGitHubWorkflowId(x: unknown): x is GitHubWorkflowId {
  return GitHubWorkflowIdSchema.safeParse(x).success
}

export function isGitHubUserId(x: unknown): x is GitHubUserId {
  return GitHubUserIdSchema.safeParse(x).success
}

export function isGitHubWorkflowRunId(x: unknown): x is GitHubWorkflowRunId {
  return GitHubWorkflowRunIdSchema.safeParse(x).success
}

export function isGitHubAppId(x: unknown): x is GitHubAppId {
  return GitHubAppIdSchema.safeParse(x).success
}

export function isGitHubInstallationId(x: unknown): x is GitHubInstallationId {
  return GitHubInstallationIdSchema.safeParse(x).success
}

export function isGitHubAccountKey(x: unknown): x is GitHubAccountKey {
  return GitHubAccountKeySchema.safeParse(x).success
}

export function isGitHubUserKey(x: unknown): x is GitHubUserKey {
  return GitHubUserKeySchema.safeParse(x).success
}

export function isGitHubOrganizationMembership(x: unknown): x is GitHubAccountMembership {
  return GitHubAccountMembershipSchema.safeParse(x).success
}

export function isGithubAccountType(x: unknown): x is GitHubAccountType {
  return GitHubAccountTypeSchema.safeParse(x).success
}

export function isGitHubUserSummary(x: unknown): x is GitHubUserSummary {
  return GitHubUserSummarySchema.safeParse(x).success
}

export function isGithubInstallation(x: unknown): x is GitHubInstallation {
  return GitHubInstallationSchema.safeParse(x).success
}

export function isGitHubPublicAccount(x: unknown): x is GitHubPublicAccount {
  return GitHubPublicAccountSchema.safeParse(x).success
}

export function isGitHubUser(x: unknown): x is GitHubUser {
  return GitHubUserSchema.safeParse(x).success
}

export function isGitHubUserToken(x: unknown): x is GitHubUserToken {
  return GitHubUserTokenSchema.safeParse(x).success
}

export function isGitHubRepo(x: unknown): x is GitHubRepo {
  return GitHubRepoSchema.safeParse(x).success
}

export function isGitHubWorkflow(x: unknown): x is GitHubWorkflow {
  return GitHubWorkflowSchema.safeParse(x).success
}

export function isGitHubWorkflowRunEvent(x: unknown): x is GitHubWorkflowRunEvent {
  return GitHubWorkflowRunEventSchema.safeParse(x).success
}

export function isGitHubPush(x: unknown): x is GitHubPush {
  return GithubPushSchema.safeParse(x).success
}
