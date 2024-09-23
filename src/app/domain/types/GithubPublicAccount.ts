import { GithubAccountId, isGithubAccountId } from './GithubKeys'
import { isNotNullObject } from '../../util/types'
import { GithubAccountType } from './GithubAccountType'

export interface GithubPublicAccount {
  accountId: GithubAccountId
  username: string
  accountType: GithubAccountType
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
