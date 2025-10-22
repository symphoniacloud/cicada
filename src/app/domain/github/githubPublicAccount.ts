import { AppState } from '../../environment/AppState.js'
import { GithubPublicAccount, publicAccountFromRawGithubUser } from '../types/GithubPublicAccount.js'
import { isSuccess, Result, successWith } from '../../util/structuredResult.js'
import { sendToEventBridge } from '../../outboundInterfaces/eventBridgeBus.js'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../multipleContexts/eventBridge.js'
import { getInstalledAccountIdForUser } from './githubMembership.js'
import { GithubUserId } from '../types/GithubUserId.js'
import { getInstallationOrThrow } from '../entityStore/entities/GithubInstallationEntity.js'
import { putPublicAccount } from '../entityStore/entities/GithubPublicAccountEntity.js'

export async function savePublicAccountWithName(
  appState: AppState,
  adminUserId: GithubUserId,
  accountName: string
): Promise<Result<GithubPublicAccount>> {
  // TOEventually - when a user can be a member of multiple installed accounts then need to
  // have them choose which one to add the public account for
  const installationAccountId = await getInstalledAccountIdForUser(appState, adminUserId)
  const githubAppInstallation = await getInstallationOrThrow(appState.entityStore, installationAccountId)
  const githubUserResult = await appState.githubClient
    .clientForInstallation(githubAppInstallation.installationId)
    .getUser(accountName)

  if (!isSuccess(githubUserResult)) {
    return githubUserResult
  }
  const publicAccount = publicAccountFromRawGithubUser(githubUserResult.result, installationAccountId)
  await putPublicAccount(appState.entityStore, publicAccount)

  // Trigger crawling public account
  await sendToEventBridge(appState, EVENTBRIDGE_DETAIL_TYPES.PUBLIC_ACCOUNT_UPDATED, {
    installation: githubAppInstallation,
    publicAccountId: publicAccount.accountId
  })

  return successWith(publicAccount)
}
