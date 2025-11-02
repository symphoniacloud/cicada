import {
  GitHubAccountId,
  GitHubAccountType,
  GitHubAppId,
  GitHubInstallation,
  GitHubInstallationId,
  GitHubPublicAccount,
  GitHubUser
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
  RawGitHubTargetType,
  RawGithubUser
} from '../../../ioTypes/RawGitHubTypes.js'
import { fromRawGithubUserId } from '../../types/toFromRawGitHubIds.js'

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

export function fromRawGithubUser(raw: RawGithubUser): GitHubUser {
  return {
    userId: fromRawGithubUserId(raw.id),
    userName: raw.login,
    url: raw.url,
    avatarUrl: raw.avatar_url,
    htmlUrl: raw.html_url
  }
}

export function publicAccountFromRawGithubUser(
  user: RawGithubUser,
  installationAccountId: GitHubAccountId
): GitHubPublicAccount {
  return {
    accountId: gitHubAccountIdFromRaw(user.id),
    accountType: gitHubAccountTypeFromRaw(user.type),
    accountName: user.login,
    installationAccountId
  }
}
