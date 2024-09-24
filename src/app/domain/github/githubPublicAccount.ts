import { AppState } from '../../environment/AppState'
import { GithubPublicAccount } from '../types/GithubPublicAccount'
import { isSuccess, Result, successWith } from '../../util/structuredResult'
import { GithubAccountId } from '../types/GithubKeys'
import {
  getPublicAccountsForOwner,
  savePublicAccount
} from '../entityStore/entities/GithubPublicAccountEntity'
import { getInstallationForAccount } from './githubInstallation'
import { ORGANIZATION_ACCOUNT_TYPE, USER_ACCOUNT_TYPE } from '../types/GithubAccountType'
import { sendToEventBridge } from '../../outboundInterfaces/eventBridgeBus'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../multipleContexts/eventBridge'
import { getIdsOfAccountsWhichUserIsMemberOf } from './githubMembership'

export async function savePublicAccountWithName(
  appState: AppState,
  adminUserId: GithubAccountId,
  accountName: string
): Promise<Result<GithubPublicAccount>> {
  // TOEventually - when a user can be a member of multiple installed accounts then need to
  // have them choose which one to add the public account for
  const ownerAccountId = (await getIdsOfAccountsWhichUserIsMemberOf(appState, adminUserId))[0]
  const githubAppInstallation = await getInstallationForAccount(appState, ownerAccountId)
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
    accountLogin: githubUser.login,
    accountType: githubUserType,
    ownerType: 'GithubAccount',
    ownerAccountId
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
  return await getPublicAccountsForOwnerAccountIds(
    appState,
    await getIdsOfAccountsWhichUserIsMemberOf(appState, userId)
  )
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