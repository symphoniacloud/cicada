import {
  GitHubAccountId,
  GitHubAccountType,
  GitHubInstallation,
  GitHubPublicAccount,
  GitHubUser
} from '../../../ioTypes/GitHubTypes.js'
import { GitHubAccountTypeSchema } from '../../../ioTypes/GitHubSchemas.js'
import { RawGithubInstallation, RawGitHubTargetType, RawGithubUser } from '../../../ioTypes/RawGitHubTypes.js'
import {
  fromRawGitHubAccountId,
  fromRawGithubAppId,
  fromRawGithubInstallationId,
  fromRawGithubUserId
} from './toFromRawGitHubIds.js'

export function gitHubAccountTypeFromRaw(raw: RawGitHubTargetType): GitHubAccountType {
  return GitHubAccountTypeSchema.parse(raw.toLowerCase())
}

export function gitHubInstallationFromRaw(raw: RawGithubInstallation): GitHubInstallation {
  return {
    installationId: fromRawGithubInstallationId(raw.id),
    appId: fromRawGithubAppId(raw.app_id),
    appSlug: raw.app_slug,
    accountName: raw.account.login,
    accountId: fromRawGitHubAccountId(raw.account.id),
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
    accountId: fromRawGitHubAccountId(user.id),
    accountType: gitHubAccountTypeFromRaw(user.type),
    accountName: user.login,
    installationAccountId
  }
}
