import {
  GITHUB_ACCOUNT_ID_PREFIX,
  GITHUB_REPO_ID_PREFIX,
  GITHUB_USER_ID_PREFIX,
  GITHUB_WORKFLOW_ID_PREFIX,
  GitHubAccountId,
  GitHubRepoId,
  GitHubUserId,
  GitHubWorkflowId,
  isGitHubAccountId,
  isGitHubRepoId,
  isGitHubUserId,
  isGitHubWorkflowId
} from '../../types/GitHubIdTypes.js'

export function fromRawGitHubAccountId(x: unknown): GitHubAccountId {
  const cicadaGitHubAccountId = `${GITHUB_ACCOUNT_ID_PREFIX}${x}`
  if (!isGitHubAccountId(cicadaGitHubAccountId)) {
    throw new Error(`Invalid raw github account id: ${x}`)
  }
  return cicadaGitHubAccountId
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
