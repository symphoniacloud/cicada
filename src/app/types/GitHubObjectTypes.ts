import { GitHubAccountIdSchema, GitHubUserIdSchema } from './GitHubIdTypes.js'
import * as z from 'zod'

export const GitHubAccountMembershipSchema = z.object({
  userId: GitHubUserIdSchema,
  accountId: GitHubAccountIdSchema
})

export type GitHubAccountMembership = z.infer<typeof GitHubAccountMembershipSchema>

// TODO - use safeParse'ing in Entity parsing, instead of this
export function isGitHubOrganizationMembership(x: unknown): x is GitHubAccountMembership {
  return GitHubAccountMembershipSchema.safeParse(x).success
}
