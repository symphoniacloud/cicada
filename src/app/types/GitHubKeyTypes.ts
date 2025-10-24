import * as z from 'zod'
import {
  GitHubAccountKeySchema,
  GitHubRepoKeySchema,
  GitHubUserKeySchema,
  GitHubWorkflowKeySchema
} from './schemas/GitHubSchemas.js'

// Putting readonly on types rather than .readonly() on the schema because Zod
// doesn't (currently) allow extending a readonly schema

export type GitHubAccountKey = Readonly<z.infer<typeof GitHubAccountKeySchema>>

export function isGitHubAccountKey(x: unknown): x is GitHubAccountKey {
  return GitHubAccountKeySchema.safeParse(x).success
}

export type GitHubRepoKey = Readonly<z.infer<typeof GitHubRepoKeySchema>>

export function isGitHubRepoKey(x: unknown): x is GitHubRepoKey {
  return GitHubRepoKeySchema.safeParse(x).success
}

export type GitHubWorkflowKey = Readonly<z.infer<typeof GitHubWorkflowKeySchema>>

export function isGitHubWorkflowKey(x: unknown): x is GitHubWorkflowKey {
  return GitHubWorkflowKeySchema.safeParse(x).success
}

export type GitHubUserKey = Readonly<z.infer<typeof GitHubUserKeySchema>>

export function isGitHubUserKey(x: unknown): x is GitHubUserKey {
  return GitHubUserKeySchema.safeParse(x).success
}
