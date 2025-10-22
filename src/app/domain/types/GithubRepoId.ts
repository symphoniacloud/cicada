import { isIntegerStringWithPrefix } from '../../util/types.js'

const GITHUB_REPO_ID_PREFIX = `GHRepo`

export type GithubRepoId = `${typeof GITHUB_REPO_ID_PREFIX}${number}`

export function isGithubRepoId(x: unknown): x is GithubRepoId {
  return isIntegerStringWithPrefix(GITHUB_REPO_ID_PREFIX, x)
}

export function fromRawGithubRepoId(x: unknown): GithubRepoId {
  const cicadaGithubRepoId = `${GITHUB_REPO_ID_PREFIX}${x}`
  if (!isGithubRepoId(cicadaGithubRepoId)) throw new Error(`Invalid raw github repo id: ${x}`)
  return cicadaGithubRepoId
}
