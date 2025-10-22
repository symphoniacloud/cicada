import { isIntegerStringWithPrefix } from '../../util/types.js'

const GITHUB_ACCOUNT_ID_PREFIX = `GHAccount`
export type GithubAccountId = `${typeof GITHUB_ACCOUNT_ID_PREFIX}${number}`

export function isGithubAccountId(x: unknown): x is GithubAccountId {
  return isIntegerStringWithPrefix(GITHUB_ACCOUNT_ID_PREFIX, x)
}

export function fromRawGithubAccountId(x: unknown): GithubAccountId {
  const cicadaGithubAccountId = `${GITHUB_ACCOUNT_ID_PREFIX}${x}`
  if (!isGithubAccountId(cicadaGithubAccountId)) {
    throw new Error(`Invalid raw github account id: ${x}`)
  }
  return cicadaGithubAccountId
}
