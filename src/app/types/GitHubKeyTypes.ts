import * as z from 'zod'
import {
  GitHubAccountIdSchema,
  GitHubRepoIdSchema,
  GitHubUserId,
  GitHubWorkflowIdSchema,
  isGitHubUserId
} from './GitHubIdTypes.js'
import { isNotNullObject } from '../util/types.js'

// -- Account
export const GitHubAccountKeySchema = z.object({
  accountId: GitHubAccountIdSchema
})

export type GitHubAccountKey = z.infer<typeof GitHubAccountKeySchema>

export function isGitHubAccountKey(x: unknown): x is GitHubAccountKey {
  return GitHubAccountKeySchema.safeParse(x).success
}

// -- Repo

export const GitHubRepoKeySchema = GitHubAccountKeySchema.extend({
  repoId: GitHubRepoIdSchema
})

export type GitHubRepoKey = z.infer<typeof GitHubRepoKeySchema>

export function isGitHubRepoKey(x: unknown): x is GitHubRepoKey {
  return GitHubRepoKeySchema.safeParse(x).success
}

// -- Workflow

export const GitHubWorkflowKeySchema = GitHubRepoKeySchema.extend({
  workflowId: GitHubWorkflowIdSchema
})

export type GitHubWorkflowKey = z.infer<typeof GitHubWorkflowKeySchema>

export function isGitHubWorkflowKey(x: unknown): x is GitHubWorkflowKey {
  return GitHubWorkflowKeySchema.safeParse(x).success
}

export interface GitHubUserKey {
  userId: GitHubUserId
}

export function isGithubUserKey(x: unknown): x is GitHubUserKey {
  return isNotNullObject(x) && 'userId' in x && isGitHubUserId(x.userId)
}
