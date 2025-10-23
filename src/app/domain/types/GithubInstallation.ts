import { RawGithubInstallation } from './rawGithub/RawGithubInstallation.js'
import { fromRawAccountType } from './GithubAccountType.js'
import { isString } from '../../util/types.js'
import { GithubAccountSummary, isGithubAccountSummary } from './GithubSummaries.js'
import {
  fromRawGitHubAccountId,
  fromRawGithubAppId,
  fromRawGithubInstallationId
} from './toFromRawGitHubIds.js'
import {
  GitHubAppId,
  GitHubInstallationId,
  isGitHubAppId,
  isGitHubInstallationId
} from '../../types/GitHubIdTypes.js'

export interface GithubInstallation extends GithubAccountSummary {
  installationId: GitHubInstallationId
  appId: GitHubAppId
  appSlug: string
}

export function isGithubInstallation(x: unknown): x is GithubInstallation {
  return (
    isGithubAccountSummary(x) &&
    'installationId' in x &&
    isGitHubInstallationId(x.installationId) &&
    'appId' in x &&
    isGitHubAppId(x.appId) &&
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
    accountId: fromRawGitHubAccountId(raw.account.id),
    accountType: fromRawAccountType(raw.target_type)
  }
}
