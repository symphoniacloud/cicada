import * as z from 'zod'
import { GitHubAccountIdSchema } from './GitHubAccountId.js'
import { GitHubRepoIdSchema } from './GitHubRepoId.js'

export const GitHubAccountCoordinatesSchema = z.object({
  accountId: GitHubAccountIdSchema
})

export type GitHubAccountCoordinates = z.infer<typeof GitHubAccountCoordinatesSchema>

export function isGitHubAccountCoordinates(x: unknown): x is GitHubAccountCoordinates {
  return GitHubAccountCoordinatesSchema.safeParse(x).success
}

export const GitHubRepoCoordinatesSchema = z.object({
  repoId: GitHubRepoIdSchema,
  accountId: GitHubAccountIdSchema
})

export type GitHubRepoCoordinates = z.infer<typeof GitHubRepoCoordinatesSchema>

export function isGitHubRepoCoordinates(x: unknown): x is GitHubRepoCoordinates {
  return GitHubRepoCoordinatesSchema.safeParse(x).success
}

export const PartialGitHubRepoCoordinatesSchema = GitHubRepoCoordinatesSchema.partial()

export type PartialGitHubRepoCoordinates = z.infer<typeof PartialGitHubRepoCoordinatesSchema>

export function isPartialGitHubRepoCoordinates(x: unknown): x is PartialGitHubRepoCoordinates {
  return PartialGitHubRepoCoordinatesSchema.safeParse(x).success
}
