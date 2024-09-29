import { isIntegerStringWithPrefix } from '../../util/types'

const GITHUB_USER_ID_PREFIX = `GHUser`
export type GithubUserId = `${typeof GITHUB_USER_ID_PREFIX}${number}`

export function isGithubUserId(x: unknown): x is GithubUserId {
  return isIntegerStringWithPrefix(GITHUB_USER_ID_PREFIX, x)
}

export function fromRawGithubUserId(x: unknown): GithubUserId {
  const cicadaGithubUserId = `${GITHUB_USER_ID_PREFIX}${x}`
  if (!isGithubUserId(cicadaGithubUserId)) {
    throw new Error(`Invalid raw github user id: ${x}`)
  } else {
    return cicadaGithubUserId
  }
}
