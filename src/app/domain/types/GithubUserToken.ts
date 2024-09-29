import { GithubUserId, isGithubUserId } from './GithubUserId'
import { isNotNullObject, isNumber, isString } from '../../util/types'

export interface GithubUserToken {
  token: string
  userId: GithubUserId
  userLogin: string
  nextCheckTime: number
}

export function isGithubUserToken(x: unknown): x is GithubUserToken {
  return (
    isNotNullObject(x) &&
    'token' in x &&
    isString(x.token) &&
    'userId' in x &&
    isGithubUserId(x.userId) &&
    'userLogin' in x &&
    isString(x.userLogin) &&
    'nextCheckTime' in x &&
    isNumber(x.nextCheckTime)
  )
}
