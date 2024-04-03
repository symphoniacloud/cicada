import { RawGithubInstallation } from './rawGithub/RawGithubInstallation'
import { fromRawAccountType, GithubAccountType, isAccountType } from './githubCommonTypes'

export interface GithubInstallation {
  installationId: number
  appId: number
  appSlug: string
  accountLogin: string
  accountId: number
  accountType: GithubAccountType
}

export function isGithubInstallation(x: unknown): x is GithubInstallation {
  const candidate = x as GithubInstallation
  return (
    candidate.installationId !== undefined &&
    candidate.appId !== undefined &&
    candidate.appSlug !== undefined &&
    candidate.accountLogin !== undefined &&
    candidate.accountId !== undefined &&
    isAccountType(candidate.accountType)
  )
}

export function fromRawGithubInstallation(raw: RawGithubInstallation): GithubInstallation {
  return {
    installationId: raw.id,
    appId: raw.app_id,
    appSlug: raw.app_slug,
    accountLogin: raw.account.login,
    accountId: raw.account.id,
    accountType: fromRawAccountType(raw.target_type)
  }
}
