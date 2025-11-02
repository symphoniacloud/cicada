import {
  GitHubAccountId,
  GitHubAccountType,
  GitHubAppId,
  GitHubInstallation,
  GitHubInstallationId
} from '../../../ioTypes/GitHubTypes.js'
import {
  GITHUB_ACCOUNT_ID_PREFIX,
  GITHUB_APP_ID_PREFIX,
  GITHUB_INSTALLATION_ID_PREFIX,
  GitHubAccountIdSchema,
  GitHubAccountTypeSchema,
  GitHubAppIdSchema,
  GitHubInstallationIdSchema
} from '../../../ioTypes/GitHubSchemas.js'
import {
  RawGitHubAccountId,
  RawGitHubAppId,
  RawGithubInstallation,
  RawGitHubInstallationId,
  RawGitHubTargetType
} from '../../../ioTypes/RawGitHubTypes.js'

export function gitHubAppIdFromRaw(raw: RawGitHubAppId): GitHubAppId {
  return GitHubAppIdSchema.parse(`${GITHUB_APP_ID_PREFIX}${raw}`)
}

export function gitHubAccountIdFromRaw(raw: RawGitHubAccountId): GitHubAccountId {
  return GitHubAccountIdSchema.parse(`${GITHUB_ACCOUNT_ID_PREFIX}${raw}`)
}

export function gitHubInstallationIdFromRaw(raw: RawGitHubInstallationId): GitHubInstallationId {
  return GitHubInstallationIdSchema.parse(`${GITHUB_INSTALLATION_ID_PREFIX}${raw}`)
}

export function gitHubAccountTypeFromRaw(raw: RawGitHubTargetType): GitHubAccountType {
  return GitHubAccountTypeSchema.parse(raw.toLowerCase())
}

export function gitHubInstallationFromRaw(raw: RawGithubInstallation): GitHubInstallation {
  return {
    installationId: gitHubInstallationIdFromRaw(raw.id),
    appId: gitHubAppIdFromRaw(raw.app_id),
    appSlug: raw.app_slug,
    accountName: raw.account.login,
    accountId: gitHubAccountIdFromRaw(raw.account.id),
    accountType: gitHubAccountTypeFromRaw(raw.target_type)
  }
}
