import { isIntegerStringWithPrefix } from '../../util/types.js'

const GITHUB_INSTALLATION_ID_PREFIX = `GHInstallation`
export type GithubInstallationId = `${typeof GITHUB_INSTALLATION_ID_PREFIX}${number}`

export function isGithubInstallationId(x: unknown): x is GithubInstallationId {
  return isIntegerStringWithPrefix(GITHUB_INSTALLATION_ID_PREFIX, x)
}

export function fromRawGithubInstallationId(x: unknown): GithubInstallationId {
  const cicadaGithubInstallationId = `${GITHUB_INSTALLATION_ID_PREFIX}${x}`
  if (!isGithubInstallationId(cicadaGithubInstallationId)) {
    throw new Error(`Invalid raw github installation id: ${x}`)
  } else {
    return cicadaGithubInstallationId
  }
}

export function toRawGithubInstallationId(installationId: GithubInstallationId) {
  return installationId.slice(GITHUB_INSTALLATION_ID_PREFIX.length)
}
