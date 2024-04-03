export interface GithubAccountMembership {
  userId: number
  accountId: number
}

export function isGithubOrganizationMembership(x: unknown): x is GithubAccountMembership {
  const candidate = x as GithubAccountMembership
  return candidate.userId !== undefined && candidate.accountId !== undefined
}
