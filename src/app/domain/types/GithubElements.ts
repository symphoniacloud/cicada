import { GithubAccountType, isGithubAccountType } from './GithubAccountType'
import { GithubAccountKey, GithubRepoKey, isGithubAccountKey, isGithubRepoKey } from './GithubKeys'
import { GithubAccountId } from './GithubAccountId'

// TODO - need better names for these

export interface GithubAccountElement extends GithubAccountKey {
  accountId: GithubAccountId
  accountName: string
  accountType: GithubAccountType
}

export interface GithubRepositoryElement extends GithubAccountElement, GithubRepoKey {
  repoName: string
}

export function isGithubAccountElement(x: unknown): x is GithubAccountElement {
  return (
    isGithubAccountKey(x) &&
    'accountName' in x &&
    typeof x.accountName === 'string' &&
    'accountType' in x &&
    isGithubAccountType(x.accountType)
  )
}

export function isGithubRepositoryElement(x: unknown): x is GithubRepositoryElement {
  return isGithubAccountElement(x) && isGithubRepoKey(x) && 'repoName' in x && typeof x.repoName === 'string'
}
