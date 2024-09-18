import { GithubAccountId, isGithubAccountId } from './GithubKeys'
import { isNotNullObject } from '../../util/types'

export interface GithubPublicAccount {
  accountId: GithubAccountId
  username: string
  ownerType: 'GithubAccount'
  ownerAccountId: GithubAccountId
}

export function isGithubPublicAccount(x: unknown): x is GithubPublicAccount {
  return (
    isNotNullObject(x) &&
    'accountId' in x &&
    isGithubAccountId(x.accountId) &&
    'username' in x &&
    typeof x.username === 'string' &&
    'ownerType' in x &&
    x.ownerType === 'GithubAccount' &&
    'ownerAccountId' in x &&
    isGithubAccountId(x.ownerAccountId)
  )
}
