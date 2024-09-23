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
import { ORGANIZATION_ACCOUNT_TYPE, USER_ACCOUNT_TYPE } from '../types/GithubAccountType'
import { sendToEventBridge } from '../../outboundInterfaces/eventBridgeBus'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../multipleContexts/eventBridge'

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
  const githubUserType = githubUser.type.toLowerCase()
  if (!(githubUserType === ORGANIZATION_ACCOUNT_TYPE || githubUserType === USER_ACCOUNT_TYPE))
    throw new Error(`Unexpected GitHub Account type for public account: ${githubUserType}`)

  const result = await savePublicAccount(appState.entityStore, {
    accountId: githubUser.id,
    username: githubUser.login,
    accountType: githubUserType,
    ownerType: 'GithubAccount',
    ownerAccountId: installationAccountId
  })

  // Trigger crawling public account
  await sendToEventBridge(appState, EVENTBRIDGE_DETAIL_TYPES.PUBLIC_ACCOUNT_UPDATED, {
    installation: githubAppInstallation,
    publicAccountId: githubUser.id
  })

  return successWith(result)
}

export async function getPublicAccountsForUser(
  appState: AppState,
  userId: GithubAccountId
): Promise<GithubPublicAccount[]> {
  return await getPublicAccountsForOwnerAccountIds(appState, await getAllAccountIdsForUser(appState, userId))
}

export async function getPublicAccountsForOwnerAccountIds(
  appState: AppState,
  ownerAccountIds: GithubAccountId[]
): Promise<GithubPublicAccount[]> {
  return (
    await Promise.all(
      ownerAccountIds.map(async (accountId) => getPublicAccountsForOwner(appState.entityStore, accountId))
    )
  ).flat()
}
