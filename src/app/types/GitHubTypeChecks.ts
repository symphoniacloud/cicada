import {
  GitHubAccountIdSchema,
  GitHubAccountKeySchema,
  GitHubAccountMembershipSchema,
  GitHubAccountSummarySchema,
  GitHubAppIdSchema,
  GitHubInstallationIdSchema,
  GitHubRepoIdSchema,
  GitHubRepoKeySchema,
  GitHubRepoSummarySchema,
  GitHubUserIdSchema,
  GitHubUserKeySchema,
  GitHubUserSummarySchema,
  GitHubWorkflowIdSchema,
  GitHubWorkflowKeySchema,
  GitHubWorkflowRunIdSchema,
  GitHubWorkflowSummarySchema
} from './schemas/GitHubSchemas.js'
import {
  GitHubAccountId,
  GitHubAccountKey,
  GitHubAccountMembership,
  GitHubAccountSummary,
  GitHubAppId,
  GitHubInstallationId,
  GitHubRepoId,
  GitHubRepoKey,
  GitHubRepoSummary,
  GitHubUserId,
  GitHubUserKey,
  GitHubUserSummary,
  GitHubWorkflowId,
  GitHubWorkflowKey,
  GitHubWorkflowRunId,
  GitHubWorkflowSummary
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

export function isGitHubRepoKey(x: unknown): x is GitHubRepoKey {
  return GitHubRepoKeySchema.safeParse(x).success
}

export function isGitHubWorkflowKey(x: unknown): x is GitHubWorkflowKey {
  return GitHubWorkflowKeySchema.safeParse(x).success
}

export function isGitHubUserKey(x: unknown): x is GitHubUserKey {
  return GitHubUserKeySchema.safeParse(x).success
}

export function isGitHubOrganizationMembership(x: unknown): x is GitHubAccountMembership {
  return GitHubAccountMembershipSchema.safeParse(x).success
}

export function isGitHubAccountSummary(x: unknown): x is GitHubAccountSummary {
  return GitHubAccountSummarySchema.safeParse(x).success
}

export function isGitHubRepoSummary(x: unknown): x is GitHubRepoSummary {
  return GitHubRepoSummarySchema.safeParse(x).success
}

export function isGitHubWorkflowSummary(x: unknown): x is GitHubWorkflowSummary {
  return GitHubWorkflowSummarySchema.safeParse(x).success
}

export function isGitHubUserSummary(x: unknown): x is GitHubUserSummary {
  return GitHubUserSummarySchema.safeParse(x).success
}
