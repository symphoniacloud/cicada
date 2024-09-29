import { RawGithubUser } from './rawGithub/RawGithubUser'
import { fromRawGithubUserId, GithubUserId, isGithubUserId } from './GithubUserId'
import { isNotNullObject, isString } from '../../util/types'

export interface GithubUser {
  login: string
  id: GithubUserId
  avatarUrl: string
  htmlUrl: string
  url: string
}

export function isGithubUser(x: unknown): x is GithubUser {
  return (
    isNotNullObject(x) &&
    'login' in x &&
    isString(x.login) &&
    'id' in x &&
    isGithubUserId(x.id) &&
    'avatarUrl' in x &&
    isString(x.avatarUrl) &&
    'htmlUrl' in x &&
    isString(x.htmlUrl) &&
    'url' in x &&
    isString(x.url)
  )
}

export function fromRawGithubUser(raw: RawGithubUser): GithubUser {
  return {
    id: fromRawGithubUserId(raw.id),
    login: raw.login,
    url: raw.url,
    avatarUrl: raw.avatar_url,
    htmlUrl: raw.html_url
  }
}
