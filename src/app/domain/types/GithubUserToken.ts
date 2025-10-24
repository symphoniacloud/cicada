import { isNumber, isString } from '../../util/types.js'
import { GitHubUserSummary } from '../../types/GitHubTypes.js'
import { isGitHubUserSummary } from '../../types/GitHubTypeChecks.js'

export interface GithubUserToken extends GitHubUserSummary {
  token: string
  nextCheckTime: number
}

export function isGithubUserToken(x: unknown): x is GithubUserToken {
  return (
    isGitHubUserSummary(x) &&
    'token' in x &&
    isString(x.token) &&
    'nextCheckTime' in x &&
    isNumber(x.nextCheckTime)
  )
}
