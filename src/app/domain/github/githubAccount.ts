import { GitHubAccountKey, GitHubAccountSummary } from '../../ioTypes/GitHubTypes.js'

export function accountKeysEqual(a1: GitHubAccountKey, a2: GitHubAccountKey) {
  return a1.accountId === a2.accountId
}

export function narrowToAccountSummary<T extends GitHubAccountSummary>({
  accountId,
  accountName,
  accountType
}: T): GitHubAccountSummary {
  return {
    accountId: accountId,
    accountName: accountName,
    accountType: accountType
  }
}
