import { AppState } from '../../environment/AppState'
import { GithubUser } from '../types/GithubUser'
import {
  deleteMemberships,
  getAllMembershipsForAccount,
  getAllMembershipsForUserId,
  putMemberships
} from '../entityStore/entities/GithubAccountMembershipEntity'
import { arrayDifferenceDeep } from '../../util/collections'
import { GithubAccountId } from '../types/GithubAccountId'
import { GithubUserId } from '../types/GithubUserId'

export async function setMemberships(
  appState: AppState,
  latestMembers: GithubUser[],
  accountId: GithubAccountId
) {
  const memberships = latestMembers.map(({ userId }) => ({
    userId,
    accountId
  }))
  const previousMemberships = await getAllMembershipsForAccount(appState.entityStore, accountId)

  await putMemberships(appState.entityStore, arrayDifferenceDeep(memberships, previousMemberships))
  await deleteMemberships(appState.entityStore, arrayDifferenceDeep(previousMemberships, memberships))
}

export async function getAccountIdsForUser(
  appState: AppState,
  userId: GithubUserId
): Promise<GithubAccountId[]> {
  return (await getAllMembershipsForUserId(appState.entityStore, userId)).map(({ accountId }) => accountId)
}

export async function getUserIdsForAccount(appState: AppState, accountId: GithubAccountId) {
  return (await getAllMembershipsForAccount(appState.entityStore, accountId)).map(({ userId }) => userId)
}
