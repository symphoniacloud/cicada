import { AppState } from '../../environment/AppState.js'
import {
  deleteMemberships,
  getAllMembershipsForAccount,
  getAllMembershipsForUserId,
  putMemberships
} from '../entityStore/entities/GithubAccountMembershipEntity.js'
import { arrayDifferenceDeep } from '../../util/collections.js'
import { throwFunction } from '../../../multipleContexts/errors.js'
import { GitHubAccountId, GitHubUser, GitHubUserId } from '../../types/GitHubTypes.js'

export async function setMemberships(
  appState: AppState,
  latestMembers: GitHubUser[],
  accountId: GitHubAccountId
) {
  const memberships = latestMembers.map(({ userId }) => ({
    userId,
    accountId
  }))
  const previousMemberships = await getAllMembershipsForAccount(appState.entityStore, accountId)

  await putMemberships(appState.entityStore, arrayDifferenceDeep(memberships, previousMemberships))
  await deleteMemberships(appState.entityStore, arrayDifferenceDeep(previousMemberships, memberships))
}

// ToEventually - support multiple installed accounts / user
export async function getInstalledAccountIdForUser(
  appState: AppState,
  userId: GitHubUserId
): Promise<GitHubAccountId> {
  return (
    (await getAllMembershipsForUserId(appState.entityStore, userId))[0]?.accountId ??
    throwFunction(`User ${userId} has no memberships - request shouldn't have been authorized `)()
  )
}

export async function isUserAMemberOfAnyInstalledAccount(appState: AppState, user: GitHubUser) {
  return (await getAllMembershipsForUserId(appState.entityStore, user.userId)).length > 0
}

export async function getUserIdsForAccount(appState: AppState, accountId: GitHubAccountId) {
  return (await getAllMembershipsForAccount(appState.entityStore, accountId)).map(({ userId }) => userId)
}
