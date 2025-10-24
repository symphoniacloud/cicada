import { GitHubAccountType } from '../../types/GitHubTypes.js'
import { isGithubAccountType } from '../../types/GitHubTypeChecks.js'

// TODO - can use zod parsing for this

export function fromRawAccountType(accountType: unknown): GitHubAccountType {
  if (typeof accountType !== 'string') {
    throw new Error('accountType type was not string')
  }

  const lower = accountType.toLowerCase()
  if (!isGithubAccountType(lower)) {
    throw new Error(`${accountType} is an unknown account type`)
  }

  return lower
}
