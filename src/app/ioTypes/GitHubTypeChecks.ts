import {
  GitHubAccountKeySchema,
  GitHubAccountTypeSchema,
  GitHubAppIdSchema,
  GitHubInstallationIdSchema,
  GitHubPublicAccountSchema,
  GitHubRepoIdSchema,
  GitHubUserIdSchema,
  GitHubWorkflowIdSchema,
  GitHubWorkflowRunIdSchema
} from './GitHubSchemas.js'
import {
  GitHubAccountKey,
  GitHubAccountType,
  GitHubAppId,
  GitHubInstallationId,
  GitHubPublicAccount,
  GitHubRepoId,
  GitHubUserId,
  GitHubWorkflowId,
  GitHubWorkflowRunId
} from './GitHubTypes.js'

// TODO These may be able to mostly go away if we start just using safe parse more

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

export function isGithubAccountType(x: unknown): x is GitHubAccountType {
  return GitHubAccountTypeSchema.safeParse(x).success
}

export function isGitHubPublicAccount(x: unknown): x is GitHubPublicAccount {
  return GitHubPublicAccountSchema.safeParse(x).success
}
