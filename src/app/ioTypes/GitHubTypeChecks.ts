import { GitHubPublicAccountSchema } from './GitHubSchemas.js'
import { GitHubPublicAccount } from './GitHubTypes.js'

// Still used for differentiating GitHubPublicAccount vs GitHubInstallation
export function isGitHubPublicAccount(x: unknown): x is GitHubPublicAccount {
  return GitHubPublicAccountSchema.safeParse(x).success
}
