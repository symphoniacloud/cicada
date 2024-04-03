export const ORGANIZATION_ACCOUNT_TYPE = 'organization'
export const USER_ACCOUNT_TYPE = 'user'
export const ACCOUNT_TYPES = [ORGANIZATION_ACCOUNT_TYPE, USER_ACCOUNT_TYPE] as const
export type GithubAccountType = (typeof ACCOUNT_TYPES)[number]

export function fromRawAccountType(accountType: unknown): GithubAccountType {
  if (typeof accountType !== 'string') {
    throw new Error('account type was not set')
  }

  const lower = accountType.toLowerCase()
  if (!isAccountType(lower)) {
    throw new Error(`${accountType} is an unknown account type`)
  }

  return lower
}

export function isAccountType(x: unknown): x is GithubAccountType {
  return ACCOUNT_TYPES.includes(x as GithubAccountType)
}
