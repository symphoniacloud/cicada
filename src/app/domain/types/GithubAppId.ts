import { isIntegerStringWithPrefix } from '../../util/types'

const GITHUB_APP_ID_PREFIX = `GHApp`
export type GithubAppId = `${typeof GITHUB_APP_ID_PREFIX}${number}`

export function isGithubAppId(x: unknown): x is GithubAppId {
  return isIntegerStringWithPrefix(GITHUB_APP_ID_PREFIX, x)
}

export function fromRawGithubAppId(x: unknown): GithubAppId {
  const cicadaGithubAppId = `${GITHUB_APP_ID_PREFIX}${x}`
  if (!isGithubAppId(cicadaGithubAppId)) {
    throw new Error(`Invalid raw github app id: ${x}`)
  } else {
    return cicadaGithubAppId
  }
}

export function toRawGithubAppId(appId: GithubAppId) {
  return appId.slice(GITHUB_APP_ID_PREFIX.length)
}
