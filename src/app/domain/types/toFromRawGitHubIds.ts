import {
  GITHUB_APP_ID_PREFIX,
  GITHUB_INSTALLATION_ID_PREFIX,
  GITHUB_REPO_ID_PREFIX,
  GITHUB_USER_ID_PREFIX,
  GITHUB_WORKFLOW_ID_PREFIX,
  GITHUB_WORKFLOW_RUN_ID_PREFIX,
  GitHubAppIdSchema,
  GitHubInstallationIdSchema,
  GitHubRepoIdSchema,
  GitHubUserIdSchema,
  GitHubWorkflowIdSchema,
  GitHubWorkflowRunIdSchema
} from '../../ioTypes/GitHubSchemas.js'
import {
  GitHubAppId,
  GitHubInstallationId,
  GitHubRepoId,
  GitHubUserId,
  GitHubWorkflowId,
  GitHubWorkflowRunId
} from '../../ioTypes/GitHubTypes.js'

export function fromRawGitHubRepoId(x: number): GitHubRepoId {
  return GitHubRepoIdSchema.parse(`${GITHUB_REPO_ID_PREFIX}${x}`)
}

export function fromRawGitHubWorkflowId(x: number): GitHubWorkflowId {
  return GitHubWorkflowIdSchema.parse(`${GITHUB_WORKFLOW_ID_PREFIX}${x}`)
}

export function fromRawGithubUserId(x: number): GitHubUserId {
  return GitHubUserIdSchema.parse(`${GITHUB_USER_ID_PREFIX}${x}`)
}

export function fromRawGithubWorkflowRunId(x: number): GitHubWorkflowRunId {
  return GitHubWorkflowRunIdSchema.parse(`${GITHUB_WORKFLOW_RUN_ID_PREFIX}${x}`)
}

export function fromRawGithubAppId(x: number): GitHubAppId {
  return GitHubAppIdSchema.parse(`${GITHUB_APP_ID_PREFIX}${x}`)
}

export function fromRawGithubInstallationId(x: number): GitHubInstallationId {
  return GitHubInstallationIdSchema.parse(`${GITHUB_INSTALLATION_ID_PREFIX}${x}`)
}

export function toRawGithubAppId(appId: GitHubAppId) {
  return appId.slice(GITHUB_APP_ID_PREFIX.length)
}

export function toRawGithubInstallationId(installationId: GitHubInstallationId) {
  return installationId.slice(GITHUB_INSTALLATION_ID_PREFIX.length)
}
