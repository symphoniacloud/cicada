import { RawGithubInstallation } from './rawGithub/RawGithubInstallation'
import { fromRawAccountType } from './GithubAccountType'
import { isString } from '../../util/types'
import { fromRawGithubAccountId } from './GithubAccountId'
import { fromRawGithubAppId, GithubAppId, isGithubAppId } from './GithubAppId'
import {
  fromRawGithubInstallationId,
  GithubInstallationId,
  isGithubInstallationId
} from './GithubInstallationId'
import { GithubAccountSummary, isGithubAccountSummary } from './GithubSummaries'

export interface GithubInstallation extends GithubAccountSummary {
  installationId: GithubInstallationId
  appId: GithubAppId
  appSlug: string
}

export function isGithubInstallation(x: unknown): x is GithubInstallation {
  return (
    isGithubAccountSummary(x) &&
    'installationId' in x &&
    isGithubInstallationId(x.installationId) &&
    'appId' in x &&
    isGithubAppId(x.appId) &&
    'appSlug' in x &&
    isString(x.appSlug)
  )
}

export function fromRawGithubInstallation(raw: RawGithubInstallation): GithubInstallation {
  return {
    installationId: fromRawGithubInstallationId(raw.id),
    appId: fromRawGithubAppId(raw.app_id),
    appSlug: raw.app_slug,
    accountName: raw.account.login,
    accountId: fromRawGithubAccountId(raw.account.id),
    accountType: fromRawAccountType(raw.target_type)
  }
}
