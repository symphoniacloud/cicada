import { RawGithubInstallationSchema } from '../../../ioTypes/RawGitHubSchemas.js'
import { GitHubInstallation } from '../../../ioTypes/GitHubTypes.js'
import {
  fromRawGitHubAccountId,
  fromRawGithubAppId,
  fromRawGithubInstallationId
} from '../../types/toFromRawGitHubIds.js'

export const TransformedGithubInstallationSchema = RawGithubInstallationSchema.transform(
  (raw): GitHubInstallation => {
    return {
      installationId: fromRawGithubInstallationId(raw.id),
      appId: fromRawGithubAppId(raw.app_id),
      appSlug: raw.app_slug,
      accountName: raw.account.login,
      accountId: fromRawGitHubAccountId(raw.account.id),
      accountType: raw.target_type === 'User' ? 'user' : 'organization'
    }
  }
)
