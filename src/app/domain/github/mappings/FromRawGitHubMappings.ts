import {
  RawGitHubAccountIdSchema,
  RawGitHubAppIdSchema,
  RawGitHubInstallationIdSchema,
  RawGithubInstallationSchema,
  RawGithubTargetTypeSchema
} from '../../../ioTypes/RawGitHubSchemas.js'
import { GitHubInstallation } from '../../../ioTypes/GitHubTypes.js'
import {
  GITHUB_ACCOUNT_ID_PREFIX,
  GITHUB_APP_ID_PREFIX,
  GITHUB_INSTALLATION_ID_PREFIX,
  GitHubAccountIdSchema,
  GitHubAccountTypeSchema,
  GitHubAppIdSchema,
  GitHubInstallationIdSchema
} from '../../../ioTypes/GitHubSchemas.js'

export const GitHubAppIdFromUnparsedRaw = RawGitHubAppIdSchema.transform(
  (raw) => `${GITHUB_APP_ID_PREFIX}${raw}`
).pipe(GitHubAppIdSchema)

export const GitHubAccountIdFromUnparsedRaw = RawGitHubAccountIdSchema.transform(
  (raw) => `${GITHUB_ACCOUNT_ID_PREFIX}${raw}`
).pipe(GitHubAccountIdSchema)

export const GitHubInstallationIdFromUnparsedRaw = RawGitHubInstallationIdSchema.transform(
  (raw) => `${GITHUB_INSTALLATION_ID_PREFIX}${raw}`
).pipe(GitHubInstallationIdSchema)

export const GithubAccountTypeFromUnparsedRaw = RawGithubTargetTypeSchema.transform((x) =>
  x.toLowerCase()
).pipe(GitHubAccountTypeSchema)

export const GithubInstallationFromUnparsedRaw = RawGithubInstallationSchema.transform(
  (raw): GitHubInstallation => {
    return {
      installationId: GitHubInstallationIdFromUnparsedRaw.parse(raw.id),
      appId: GitHubAppIdFromUnparsedRaw.parse(raw.app_id),
      appSlug: raw.app_slug,
      accountName: raw.account.login,
      accountId: GitHubAccountIdFromUnparsedRaw.parse(raw.account.id),
      accountType: GithubAccountTypeFromUnparsedRaw.parse(raw.target_type)
    }
  }
)
