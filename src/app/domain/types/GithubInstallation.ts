import { RawGithubInstallation } from './rawGithub/RawGithubInstallation'
import { fromRawAccountType, GithubAccountType, isGithubAccountType } from './GithubAccountType'
import { isNotNullObject, isString } from '../../util/types'
import { fromRawGithubAccountId, GithubAccountId, isGithubAccountId } from './GithubAccountId'
import { fromRawGithubAppId, GithubAppId, isGithubAppId } from './GithubAppId'
import {
  fromRawGithubInstallationId,
  GithubInstallationId,
  isGithubInstallationId
} from './GithubInstallationId'

export interface GithubInstallation {
  installationId: GithubInstallationId
  appId: GithubAppId
  appSlug: string
  accountLogin: string
  accountId: GithubAccountId
  accountType: GithubAccountType
}

export function isGithubInstallation(x: unknown): x is GithubInstallation {
  return (
    isNotNullObject(x) &&
    'installationId' in x &&
    isGithubInstallationId(x.installationId) &&
    'appId' in x &&
    isGithubAppId(x.appId) &&
    'appSlug' in x &&
    isString(x.appSlug) &&
    'accountLogin' in x &&
    isString(x.accountLogin) &&
    'accountId' in x &&
    isGithubAccountId(x.accountId) &&
    'accountType' in x &&
    isGithubAccountType(x.accountType)
  )
}

export function fromRawGithubInstallation(raw: RawGithubInstallation): GithubInstallation {
  return {
    installationId: fromRawGithubInstallationId(raw.id),
    appId: fromRawGithubAppId(raw.app_id),
    appSlug: raw.app_slug,
    accountLogin: raw.account.login,
    accountId: fromRawGithubAccountId(raw.account.id),
    accountType: fromRawAccountType(raw.target_type)
  }
}
