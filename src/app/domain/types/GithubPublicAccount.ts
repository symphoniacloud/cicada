import { GithubAccountId, isGithubAccountId } from './GithubKeys'
import { isNotNullObject } from '../../util/types'
import { GithubAccountType } from './GithubAccountType'

export interface GithubPublicAccount {
  accountId: GithubAccountId
  accountLogin: string
  accountType: GithubAccountType
  ownerType: 'GithubAccount'
  ownerAccountId: GithubAccountId
}

export function isGithubPublicAccount(x: unknown): x is GithubPublicAccount {
  return (
    isNotNullObject(x) &&
    'accountId' in x &&
    isGithubAccountId(x.accountId) &&
    'accountLogin' in x &&
    typeof x.accountLogin === 'string' &&
    'ownerType' in x &&
    x.ownerType === 'GithubAccount' &&
    'ownerAccountId' in x &&
    isGithubAccountId(x.ownerAccountId)
  )
}
