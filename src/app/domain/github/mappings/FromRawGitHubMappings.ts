import { RawGithubInstallationSchema, RawGithubTargetTypeSchema } from '../../../ioTypes/RawGitHubSchemas.js'
import { GitHubInstallation } from '../../../ioTypes/GitHubTypes.js'
import {
  fromRawGitHubAccountId,
  fromRawGithubAppId,
  fromRawGithubInstallationId
} from '../../types/toFromRawGitHubIds.js'
import { GitHubAccountTypeSchema } from '../../../ioTypes/GitHubSchemas.js'
import { RawGitHubTargetType } from '../../../ioTypes/RawGitHubTypes.js'

export const GithubAccountTypeFromUnparsedRaw = RawGithubTargetTypeSchema.transform(
  (x: RawGitHubTargetType) => x.toLowerCase()
).pipe(GitHubAccountTypeSchema)

export const GithubInstallationFromUnparsedRaw = RawGithubInstallationSchema.transform(
  (raw): GitHubInstallation => {
    return {
      installationId: fromRawGithubInstallationId(raw.id),
      appId: fromRawGithubAppId(raw.app_id),
      appSlug: raw.app_slug,
      accountName: raw.account.login,
      accountId: fromRawGitHubAccountId(raw.account.id),
      accountType: GithubAccountTypeFromUnparsedRaw.parse(raw.target_type)
    }
  }
)
