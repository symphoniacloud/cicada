import { GithubAccountId } from './GithubAccountId'
import { GithubAccountType } from './GithubAccountType'

export const INSTALLED_ACCOUNT_TYPE = 'installed'
export const PUBLIC_ACCOUNT_TYPE = 'public'
export const CICADA_ACCOUNT_TYPES = [INSTALLED_ACCOUNT_TYPE, PUBLIC_ACCOUNT_TYPE] as const

export type CicadaAccountType = (typeof CICADA_ACCOUNT_TYPES)[number]

export interface GithubAccount {
  accountId: GithubAccountId
  accountLogin: string
  accountType: GithubAccountType
  cicadaAccountType: CicadaAccountType
}
