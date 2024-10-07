import { GithubAccountSummary } from '../types/GithubSummaries'
import { GithubAccountKey } from '../types/GithubKeys'

export function accountKeysEqual(a1: GithubAccountKey, a2: GithubAccountKey) {
  return a1.accountId === a2.accountId
}

export function narrowToAccountSummary<T extends GithubAccountSummary>({
  accountId,
  accountName,
  accountType
}: T): GithubAccountSummary {
  return {
    accountId: accountId,
    accountName: accountName,
    accountType: accountType
  }
}
