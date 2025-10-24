import { GitHubAccountType, GitHubInstallation } from '../../types/GitHubTypes.js'
import { isGithubAccountType } from '../../types/GitHubTypeChecks.js'
import { RawGithubInstallation } from './rawGithub/RawGithubInstallation.js'
import {
  fromRawGitHubAccountId,
  fromRawGithubAppId,
  fromRawGithubInstallationId
} from './toFromRawGitHubIds.js'

// TODO - can use zod parsing for this

export function fromRawAccountType(accountType: unknown): GitHubAccountType {
  if (typeof accountType !== 'string') {
    throw new Error('accountType type was not string')
  }

  const lower = accountType.toLowerCase()
  if (!isGithubAccountType(lower)) {
    throw new Error(`${accountType} is an unknown account type`)
  }

  return lower
}

export function fromRawGithubInstallation(raw: RawGithubInstallation): GitHubInstallation {
  return {
    installationId: fromRawGithubInstallationId(raw.id),
    appId: fromRawGithubAppId(raw.app_id),
    appSlug: raw.app_slug,
    accountName: raw.account.login,
    accountId: fromRawGitHubAccountId(raw.account.id),
    accountType: fromRawAccountType(raw.target_type)
  }
}
