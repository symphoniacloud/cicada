import { z } from 'zod'
import {
  fromRawGitHubAccountId,
  fromRawGithubAppId,
  fromRawGithubInstallationId
} from '../toFromRawGitHubIds.js'
import { GitHubInstallation } from '../../../ioTypes/GitHubTypes.js'

export const RawGithubTargetTypeSchema = z.literal(['User', 'Organization'])

export const RawGithubInstallationSchema = z.object({
  id: z.number(),
  account: z.object({
    login: z.string(),
    id: z.number()
  }),
  target_type: RawGithubTargetTypeSchema,
  app_id: z.number(),
  app_slug: z.string()
})

export type RawGithubInstallation = z.infer<typeof RawGithubInstallationSchema>

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
