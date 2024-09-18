import { AppState } from '../../environment/AppState'
import { GithubPublicAccount } from '../types/GithubPublicAccount'
import { isSuccess, Result, successWith } from '../../util/structuredResult'
import { GithubAccountId } from '../types/GithubKeys'
import {
  getPublicAccountsForOwner,
  savePublicAccount
} from '../entityStore/entities/GithubPublicAccountEntity'
import { getAllAccountIdsForUser } from './githubMembership'
import { getInstallationForAccount } from './githubInstallation'

export async function savePublicAccountWithName(
  appState: AppState,
  adminUserId: GithubAccountId,
  accountName: string
): Promise<Result<GithubPublicAccount>> {
  // TOEventually - when a user can be a member of multiple installed accounts then need to
  // have them choose which one to add the public account for
  const installationAccountId = (await getAllAccountIdsForUser(appState, adminUserId))[0]
  const githubAppInstallation = await getInstallationForAccount(appState, installationAccountId)
  const githubUserResult = await appState.githubClient
    .clientForInstallation(githubAppInstallation.installationId)
    .getUser(accountName)

  if (!isSuccess(githubUserResult)) {
    return githubUserResult
  }

  const githubUser = githubUserResult.result
  return successWith(
    await savePublicAccount(appState.entityStore, {
      accountId: githubUser.id,
      username: githubUser.login,
      ownerType: 'GithubAccount',
      ownerAccountId: installationAccountId
    })
  )
}

export async function getPublicAccountsForUser(
  appState: AppState,
  userId: GithubAccountId
): Promise<GithubPublicAccount[]> {
  const accountIds = await getAllAccountIdsForUser(appState, userId)
  return (
    await Promise.all(
      accountIds.map(async (accountId) => getPublicAccountsForOwner(appState.entityStore, accountId))
    )
  ).flat()
}
