import * as z from 'zod'
import { GitHubAccountIdSchema } from './GitHubAccountId.js'

export const GitHubAccountCoordinatesSchema = z.object({
  accountId: GitHubAccountIdSchema
})

export type GitHubAccountCoordinates = z.infer<typeof GitHubAccountCoordinatesSchema>

export function isGitHubAccountCoordinates(x: unknown): x is GitHubAccountCoordinates {
  return GitHubAccountCoordinatesSchema.safeParse(x).success
}
