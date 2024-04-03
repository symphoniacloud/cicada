import { RawGithubUser } from './rawGithub/RawGithubUser'

export interface GithubUser {
  login: string
  id: number
  avatarUrl: string
  htmlUrl: string
  url: string
}

export function isGithubUser(x: unknown): x is GithubUser {
  const candidate = x as GithubUser
  return (
    candidate.login !== undefined &&
    candidate.id !== undefined &&
    candidate.avatarUrl !== undefined &&
    candidate.htmlUrl !== undefined &&
    candidate.url !== undefined
  )
}

export function fromRawGithubUser(raw: RawGithubUser): GithubUser {
  return {
    id: raw.id,
    login: raw.login,
    url: raw.url,
    avatarUrl: raw.avatar_url,
    htmlUrl: raw.html_url
  }
}
