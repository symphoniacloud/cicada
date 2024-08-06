import { GithubAccountType, isGithubAccountType } from './GithubAccountType'
import { GithubAccountKey, GithubRepoKey, isGithubAccountKey, isGithubRepoKey } from './GithubKeys'

// TODO - need better names for these

export interface GithubAccountElement extends GithubAccountKey {
  ownerId: number
  ownerName: string
  ownerType: GithubAccountType
}

export interface GithubRepositoryElement extends GithubAccountElement, GithubRepoKey {
  repoName: string
}

export function isGithubAccountElement(x: unknown): x is GithubAccountElement {
  return (
    isGithubAccountKey(x) &&
    'ownerName' in x &&
    typeof x.ownerName === 'string' &&
    'ownerType' in x &&
    isGithubAccountType(x.ownerType)
  )
}

export function isGithubRepositoryElement(x: unknown): x is GithubRepositoryElement {
  return isGithubAccountElement(x) && isGithubRepoKey(x) && 'repoName' in x && typeof x.repoName === 'string'
}
