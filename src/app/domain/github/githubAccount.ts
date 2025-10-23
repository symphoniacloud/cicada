import { GithubAccountSummary } from '../types/GithubSummaries.js'

import { GitHubAccountKey } from '../../types/GitHubKeyTypes.js'

export function accountKeysEqual(a1: GitHubAccountKey, a2: GitHubAccountKey) {
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
