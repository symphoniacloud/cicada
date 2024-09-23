import { AppState } from '../../environment/AppState'
import { GithubUser } from '../types/GithubUser'
import { GithubAccountMembershipEntity } from '../entityStore/entities/GithubAccountMembershipEntity'
import { GithubAccountMembership } from '../types/GithubAccountMembership'
import { arrayDifferenceDeep } from '../../util/collections'
import { GithubAccountId, GithubUserId } from '../types/GithubKeys'
import { getPublicAccountsForOwnerAccountIds } from './githubPublicAccountEntity'

export async function setMemberships(
  appState: AppState,
  latestMembers: GithubUser[],
  accountId: GithubAccountId
) {
  const store = membershipStore(appState)
  const { newMemberships, expiredMemberships } = calculateMembershipUpdates(
    latestMembers.map(({ id }) => ({
      userId: id,
      accountId
    })),
    await store.queryAllByPk({ accountId })
  )

  if (newMemberships.length > 0) await store.advancedOperations.batchPut(newMemberships)
  if (expiredMemberships.length > 0) await store.advancedOperations.batchDelete(expiredMemberships)
}

export function calculateMembershipUpdates(
  currentMemberships: GithubAccountMembership[],
  previousMemberships: GithubAccountMembership[]
) {
  return {
    newMemberships: arrayDifferenceDeep(currentMemberships, previousMemberships),
    expiredMemberships: arrayDifferenceDeep(previousMemberships, currentMemberships)
  }
}

export async function getAllAccountIdsForUser(appState: AppState, userId: GithubUserId): Promise<number[]> {
  const memberAccountIds = (
    await membershipStore(appState).queryAllWithGsiByPk({ userId }, { gsiId: 'gsi1' })
  ).map(({ accountId }) => accountId)
  const publicAccounts = await getPublicAccountsForOwnerAccountIds(appState, memberAccountIds)
  return [...memberAccountIds, ...publicAccounts.map(({ accountId }) => accountId)]
}

function membershipStore(appState: AppState) {
  return appState.entityStore.for(GithubAccountMembershipEntity)
}

export async function getMemberIds(appState: AppState, accountId: GithubAccountId) {
  return (await membershipStore(appState).queryAllByPk({ accountId })).map(({ userId }) => userId)
}
