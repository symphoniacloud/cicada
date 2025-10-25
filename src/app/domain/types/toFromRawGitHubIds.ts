import {
  GITHUB_ACCOUNT_ID_PREFIX,
  GITHUB_APP_ID_PREFIX,
  GITHUB_INSTALLATION_ID_PREFIX,
  GITHUB_REPO_ID_PREFIX,
  GITHUB_USER_ID_PREFIX,
  GITHUB_WORKFLOW_ID_PREFIX,
  GITHUB_WORKFLOW_RUN_ID_PREFIX,
  GitHubAccountIdSchema
} from '../../ioTypes/GitHubSchemas.js'
import {
  isGitHubAppId,
  isGitHubInstallationId,
  isGitHubRepoId,
  isGitHubUserId,
  isGitHubWorkflowId,
  isGitHubWorkflowRunId
} from '../../ioTypes/GitHubTypeChecks.js'
import {
  GitHubAccountId,
  GitHubAppId,
  GitHubInstallationId,
  GitHubRepoId,
  GitHubUserId,
  GitHubWorkflowId,
  GitHubWorkflowRunId
} from '../../ioTypes/GitHubTypes.js'

export function fromRawGitHubAccountId(x: string | number): GitHubAccountId {
  // TODO - can we use a zod function here?
  return GitHubAccountIdSchema.parse(`${GITHUB_ACCOUNT_ID_PREFIX}${x}`)
}

export function fromRawGitHubRepoId(x: unknown): GitHubRepoId {
  const cicadaGitHubRepoId = `${GITHUB_REPO_ID_PREFIX}${x}`
  if (!isGitHubRepoId(cicadaGitHubRepoId)) throw new Error(`Invalid raw github repo id: ${x}`)
  return cicadaGitHubRepoId
}

export function fromRawGitHubWorkflowId(x: unknown): GitHubWorkflowId {
  const cicadaGitHubWorkflowId = `${GITHUB_WORKFLOW_ID_PREFIX}${x}`
  if (!isGitHubWorkflowId(cicadaGitHubWorkflowId)) throw new Error(`Invalid raw github workflow id: ${x}`)
  return cicadaGitHubWorkflowId
}

export function fromRawGithubUserId(x: unknown): GitHubUserId {
  const cicadaGithubUserId = `${GITHUB_USER_ID_PREFIX}${x}`
  if (!isGitHubUserId(cicadaGithubUserId)) {
    throw new Error(`Invalid raw github user id: ${x}`)
  } else {
    return cicadaGithubUserId
  }
}

export function fromRawGithubWorkflowRunId(x: unknown): GitHubWorkflowRunId {
  const cicadaRunId = `${GITHUB_WORKFLOW_RUN_ID_PREFIX}${x}`
  if (!isGitHubWorkflowRunId(cicadaRunId)) {
    throw new Error(`Invalid raw github workflow run id: ${x}`)
  }
  return cicadaRunId
}

export function fromRawGithubAppId(x: unknown): GitHubAppId {
  const cicadaGithubAppId = `${GITHUB_APP_ID_PREFIX}${x}`
  if (!isGitHubAppId(cicadaGithubAppId)) {
    throw new Error(`Invalid raw github app id: ${x}`)
  } else {
    return cicadaGithubAppId
  }
}

export function toRawGithubAppId(appId: GitHubAppId) {
  return appId.slice(GITHUB_APP_ID_PREFIX.length)
}

export function fromRawGithubInstallationId(x: unknown): GitHubInstallationId {
  const cicadaGithubInstallationId = `${GITHUB_INSTALLATION_ID_PREFIX}${x}`
  if (!isGitHubInstallationId(cicadaGithubInstallationId)) {
    throw new Error(`Invalid raw github installation id: ${x}`)
  } else {
    return cicadaGithubInstallationId
  }
}

export function toRawGithubInstallationId(installationId: GitHubInstallationId) {
  return installationId.slice(GITHUB_INSTALLATION_ID_PREFIX.length)
}
