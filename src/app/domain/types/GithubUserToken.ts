import { isNumber, isString } from '../../util/types.js'
import { GithubUserSummary, isGithubUserSummary } from './GithubSummaries.js'

export interface GithubUserToken extends GithubUserSummary {
  token: string
  nextCheckTime: number
}

export function isGithubUserToken(x: unknown): x is GithubUserToken {
  return (
    isGithubUserSummary(x) &&
    'token' in x &&
    isString(x.token) &&
    'nextCheckTime' in x &&
    isNumber(x.nextCheckTime)
  )
}
