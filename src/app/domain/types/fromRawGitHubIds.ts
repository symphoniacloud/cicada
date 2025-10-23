import { GITHUB_ACCOUNT_ID_PREFIX, GitHubAccountId, isGitHubAccountId } from '../../types/GitHubIdTypes.js'

export function fromRawGitHubAccountId(x: unknown): GitHubAccountId {
  const cicadaGitHubAccountId = `${GITHUB_ACCOUNT_ID_PREFIX}${x}`
  if (!isGitHubAccountId(cicadaGitHubAccountId)) {
    throw new Error(`Invalid raw github account id: ${x}`)
  }
  return cicadaGitHubAccountId
}
