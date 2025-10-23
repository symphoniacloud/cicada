import {
  GITHUB_ACCOUNT_ID_PREFIX,
  GITHUB_REPO_ID_PREFIX,
  GitHubAccountId,
  GitHubRepoId,
  isGitHubAccountId,
  isGitHubRepoId
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
