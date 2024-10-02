import { RawGithubUser } from './rawGithub/RawGithubUser'
import { fromRawGithubUserId } from './GithubUserId'
import { isString } from '../../util/types'
import { GithubUserSummary, isGithubUserSummary } from './GithubSummaries'

export interface GithubUser extends GithubUserSummary {
  avatarUrl: string
  htmlUrl: string
  url: string
}

export function isGithubUser(x: unknown): x is GithubUser {
  return (
    isGithubUserSummary(x) &&
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
    userId: fromRawGithubUserId(raw.id),
    userName: raw.login,
    url: raw.url,
    avatarUrl: raw.avatar_url,
    htmlUrl: raw.html_url
  }
}
