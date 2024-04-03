import { GithubAccountType } from './githubCommonTypes'

export interface GithubRepositoryElement {
  ownerId: number
  ownerName: string
  ownerType: GithubAccountType
  repoId: number
  repoName: string
}
