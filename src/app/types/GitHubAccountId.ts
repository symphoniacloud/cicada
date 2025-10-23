import * as z from 'zod'

const GITHUB_ACCOUNT_ID_PREFIX = `GHAccount`

export const GitHubAccountIdSchema = z
  .templateLiteral([z.literal(GITHUB_ACCOUNT_ID_PREFIX), z.number().int().nonnegative()])
  .readonly()

export type GitHubAccountId = z.infer<typeof GitHubAccountIdSchema>

export function isGitHubAccountId(x: unknown): x is GitHubAccountId {
  return GitHubAccountIdSchema.safeParse(x).success
}
