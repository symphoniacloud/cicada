import { isNumber, isString } from '../../util/types'
import { GithubUserSummary, isGithubUserSummary } from './GithubSummaries'

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
