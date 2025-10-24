import { RawGithubUser } from './rawGithub/RawGithubUser.js'
import { isString } from '../../util/types.js'
import { fromRawGithubUserId } from './toFromRawGitHubIds.js'
import { GitHubUserSummary } from '../../types/GitHubTypes.js'
import { isGitHubUserSummary } from '../../types/GitHubTypeChecks.js'

export interface GithubUser extends GitHubUserSummary {
  avatarUrl: string
  htmlUrl: string
  url: string
}

export function isGithubUser(x: unknown): x is GithubUser {
  return (
    isGitHubUserSummary(x) &&
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
