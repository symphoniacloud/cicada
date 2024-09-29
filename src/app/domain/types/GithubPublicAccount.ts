import { GithubAccountId, isGithubAccountId } from './GithubAccountId'
import { isNotNullObject } from '../../util/types'
import { GithubAccountType } from './GithubAccountType'

export interface GithubPublicAccount {
  accountId: GithubAccountId
  accountLogin: string
  accountType: GithubAccountType
  installationAccountId: GithubAccountId
}

export function isGithubPublicAccount(x: unknown): x is GithubPublicAccount {
  return (
    isNotNullObject(x) &&
    'accountId' in x &&
    isGithubAccountId(x.accountId) &&
    'accountLogin' in x &&
    typeof x.accountLogin === 'string' &&
    'installationAccountId' in x &&
    isGithubAccountId(x.installationAccountId)
  )
}
