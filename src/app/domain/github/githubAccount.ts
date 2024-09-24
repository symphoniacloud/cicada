import { AppState } from '../../environment/AppState'
import { GithubAccountId, GithubUserId } from '../types/GithubKeys'
import { getIdsOfAccountsWhichUserIsMemberOf } from './githubMembership'
import { getPublicAccountsForOwnerAccountIds } from './githubPublicAccount'
import { GithubAccount, INSTALLED_ACCOUNT_TYPE, PUBLIC_ACCOUNT_TYPE } from '../types/GithubAccount'
import { getInstallationForAccount } from './githubInstallation'

// This is business logic for where member accounts and public accounts are grouped together

export async function getAllAccountIdsForUser(
  appState: AppState,
  userId: GithubUserId
): Promise<GithubAccountId[]> {
  const { memberAccountIds, publicAccounts } = await memberAccountIdsAndPublicAccounts(appState, userId)
  return [...memberAccountIds, ...publicAccounts.map(({ accountId }) => accountId)]
}

export async function getAllAccountsForUser(
  appState: AppState,
  userId: GithubUserId
): Promise<GithubAccount[]> {
  const { memberAccountIds, publicAccounts } = await memberAccountIdsAndPublicAccounts(appState, userId)
  const memberAccounts: GithubAccount[] = await Promise.all(
    memberAccountIds.map(async (accountId) => {
      return {
        ...(await getInstallationForAccount(appState, accountId)),
        cicadaAccountType: INSTALLED_ACCOUNT_TYPE
      }
    })
  )
  const publicAccountsWithType: GithubAccount[] = publicAccounts.map((acc) => {
    return { ...acc, cicadaAccountType: PUBLIC_ACCOUNT_TYPE }
  })

  return [...memberAccounts, ...publicAccountsWithType]
}

export async function getAccountForUser(
  appState: AppState,
  userId: GithubUserId,
  accountId: GithubAccountId
) {
  return (await getAllAccountsForUser(appState, userId)).find((account) => account.accountId === accountId)
}

async function memberAccountIdsAndPublicAccounts(appState: AppState, userId: GithubUserId) {
  const memberAccountIds = await getIdsOfAccountsWhichUserIsMemberOf(appState, userId)
  const publicAccounts = await getPublicAccountsForOwnerAccountIds(appState, memberAccountIds)

  return {
    memberAccountIds,
    publicAccounts
  }
}
