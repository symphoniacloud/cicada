import * as z from 'zod'

const GITHUB_REPO_ID_PREFIX = `GHRepo`

export const GitHubRepoIdSchema = z
  .templateLiteral([z.literal(GITHUB_REPO_ID_PREFIX), z.number().int().nonnegative()])
  .readonly()

export type GitHubAccountId = z.infer<typeof GitHubRepoIdSchema>

export function isGitHubRepoId(x: unknown): x is GitHubAccountId {
  return GitHubRepoIdSchema.safeParse(x).success
}
