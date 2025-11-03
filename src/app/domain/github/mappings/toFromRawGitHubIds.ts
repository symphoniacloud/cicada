import {
  GITHUB_ACCOUNT_ID_PREFIX,
  GITHUB_APP_ID_PREFIX,
  GITHUB_INSTALLATION_ID_PREFIX,
  GITHUB_REPO_ID_PREFIX,
  GITHUB_USER_ID_PREFIX,
  GITHUB_WORKFLOW_ID_PREFIX,
  GITHUB_WORKFLOW_RUN_ID_PREFIX,
  GitHubAccountIdSchema,
  GitHubAppIdSchema,
  GitHubInstallationIdSchema,
  GitHubRepoIdSchema,
  GitHubUserIdSchema,
  GitHubWorkflowIdSchema,
  GitHubWorkflowRunIdSchema
} from '../../../ioTypes/GitHubSchemas.js'
import {
  GitHubAccountId,
  GitHubAppId,
  GitHubInstallationId,
  GitHubRepoId,
  GitHubUserId,
  GitHubWorkflowId,
  GitHubWorkflowRunId
} from '../../../ioTypes/GitHubTypes.js'
import {
  RawGitHubAccountId,
  RawGitHubAppId,
  RawGitHubInstallationId,
  RawGitHubRepoId,
  RawGitHubUserId
} from '../../../ioTypes/RawGitHubTypes.js'
import { RawGitHubAppIdSchema, RawGitHubInstallationIdSchema } from '../../../ioTypes/RawGitHubSchemas.js'

export function fromRawGithubAppId(x: RawGitHubAppId): GitHubAppId {
  return GitHubAppIdSchema.parse(`${GITHUB_APP_ID_PREFIX}${x}`)
}

export function toRawGithubAppId(appId: GitHubAppId) {
  return RawGitHubAppIdSchema.parse(appId.slice(GITHUB_APP_ID_PREFIX.length))
}

export function fromRawGithubInstallationId(x: RawGitHubInstallationId): GitHubInstallationId {
  return GitHubInstallationIdSchema.parse(`${GITHUB_INSTALLATION_ID_PREFIX}${x}`)
}

export function toRawGithubInstallationId(installationId: GitHubInstallationId) {
  return RawGitHubInstallationIdSchema.parse(installationId.slice(GITHUB_INSTALLATION_ID_PREFIX.length))
}

export function fromRawGitHubAccountId(raw: RawGitHubAccountId): GitHubAccountId {
  return GitHubAccountIdSchema.parse(`${GITHUB_ACCOUNT_ID_PREFIX}${raw}`)
}

export function fromRawGithubUserId(x: RawGitHubUserId): GitHubUserId {
  return GitHubUserIdSchema.parse(`${GITHUB_USER_ID_PREFIX}${x}`)
}

export function fromRawGitHubRepoId(x: RawGitHubRepoId): GitHubRepoId {
  return GitHubRepoIdSchema.parse(`${GITHUB_REPO_ID_PREFIX}${x}`)
}

export function fromRawGitHubWorkflowId(x: number): GitHubWorkflowId {
  return GitHubWorkflowIdSchema.parse(`${GITHUB_WORKFLOW_ID_PREFIX}${x}`)
}

export function fromRawGithubWorkflowRunId(x: number): GitHubWorkflowRunId {
  return GitHubWorkflowRunIdSchema.parse(`${GITHUB_WORKFLOW_RUN_ID_PREFIX}${x}`)
}
