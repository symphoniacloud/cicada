import { ORGANIZATION_ACCOUNT_TYPE, USER_ACCOUNT_TYPE } from '../../types/schemas/GitHubSchemas.js'

export const ACCOUNT_TYPES = [ORGANIZATION_ACCOUNT_TYPE, USER_ACCOUNT_TYPE] as const

export type GithubAccountType = (typeof ACCOUNT_TYPES)[number]

export function fromRawAccountType(accountType: unknown): GithubAccountType {
  if (typeof accountType !== 'string') {
    throw new Error('accountType type was not string')
  }

  const lower = accountType.toLowerCase()
  if (!isGithubAccountType(lower)) {
    throw new Error(`${accountType} is an unknown account type`)
  }

  return lower
}

export function isGithubAccountType(x: unknown): x is GithubAccountType {
  return typeof x === 'string' && ACCOUNT_TYPES.includes(x as GithubAccountType)
}
