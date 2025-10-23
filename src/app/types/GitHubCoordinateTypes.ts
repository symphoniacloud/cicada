import * as z from 'zod'
import { GitHubAccountIdSchema, GitHubRepoIdSchema, GitHubWorkflowIdSchema } from './GitHubIdTypes.js'

// -- Account
export const GitHubAccountCoordinatesSchema = z.object({
  accountId: GitHubAccountIdSchema
})

export type GitHubAccountCoordinates = z.infer<typeof GitHubAccountCoordinatesSchema>

export function isGitHubAccountCoordinates(x: unknown): x is GitHubAccountCoordinates {
  return GitHubAccountCoordinatesSchema.safeParse(x).success
}

// -- Repo

export const GitHubRepoCoordinatesSchema = GitHubAccountCoordinatesSchema.extend({
  repoId: GitHubRepoIdSchema
})

export type GitHubRepoCoordinates = z.infer<typeof GitHubRepoCoordinatesSchema>

export function isGitHubRepoCoordinates(x: unknown): x is GitHubRepoCoordinates {
  return GitHubRepoCoordinatesSchema.safeParse(x).success
}

// -- Workflow

export const GitHubWorkflowCoordinatesSchema = GitHubRepoCoordinatesSchema.extend({
  workflowId: GitHubWorkflowIdSchema
})

export type GitHubWorkflowCoordinates = z.infer<typeof GitHubWorkflowCoordinatesSchema>

export function isGitHubWorkflowCoordinates(x: unknown): x is GitHubWorkflowCoordinates {
  return GitHubWorkflowCoordinatesSchema.safeParse(x).success
}
