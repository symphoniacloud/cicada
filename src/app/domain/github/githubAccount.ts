import { AppState } from '../../environment/AppState'
import { GithubAccountId } from '../types/GithubAccountId'
import { GithubUserId } from '../types/GithubUserId'
import { getIdsOfAccountsWhichUserIsMemberOf } from './githubMembership'
import { getPublicAccountsForInstallationAccountIds } from './githubPublicAccount'
import { GithubAccountSummary } from '../types/GithubSummaries'
import { getInstallationOrThrow } from '../entityStore/entities/GithubInstallationEntity'
import { GithubAccountKey } from '../types/GithubKeys'
import { GithubPublicAccount } from '../types/GithubPublicAccount'

export function accountKeysEqual(a1: GithubAccountKey, a2: GithubAccountKey) {
  return a1.accountId === a2.accountId
}

export function toAccountSummary<T extends GithubAccountSummary>({
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

// TODO - update this for account structure
export async function getAllAccountIdsForUser(
  appState: AppState,
  userId: GithubUserId
): Promise<GithubAccountId[]> {
  const { memberAccountIds, publicAccounts } = await memberAccountIdsAndPublicAccounts(appState, userId)
  return [...memberAccountIds, ...publicAccounts.map(({ accountId }) => accountId)]
}

// TODO - update this for account structure
export async function getAllAccountsForUser(
  appState: AppState,
  userId: GithubUserId
): Promise<{
  publicAccounts: GithubPublicAccount[]
  memberAccounts: GithubAccountSummary[]
}> {
  const { memberAccountIds, publicAccounts } = await memberAccountIdsAndPublicAccounts(appState, userId)
  const memberAccounts: GithubAccountSummary[] = await Promise.all(
    memberAccountIds.map(async (accountId) => {
      return await getInstallationOrThrow(appState.entityStore, accountId)
    })
  )

  return { memberAccounts, publicAccounts }
}

// TODO - update this for account structure
export async function getAccountForUser(
  appState: AppState,
  userId: GithubUserId,
  accountId: GithubAccountId
) {
  const { memberAccounts, publicAccounts } = await getAllAccountsForUser(appState, userId)
  return [...memberAccounts, ...publicAccounts].find((account) => account.accountId === accountId)
}

// TODO - update this for account structure
async function memberAccountIdsAndPublicAccounts(appState: AppState, userId: GithubUserId) {
  const memberAccountIds = await getIdsOfAccountsWhichUserIsMemberOf(appState, userId)
  const publicAccounts = await getPublicAccountsForInstallationAccountIds(appState, memberAccountIds)

  return {
    memberAccountIds,
    publicAccounts
  }
}
