import { AppState } from '../../environment/AppState'
import { GithubPublicAccount, publicAccountFromRawGithubUser } from '../types/GithubPublicAccount'
import { isSuccess, Result, successWith } from '../../util/structuredResult'
import { sendToEventBridge } from '../../outboundInterfaces/eventBridgeBus'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../multipleContexts/eventBridge'
import { getInstalledAccountIdForUser } from './githubMembership'
import { GithubUserId } from '../types/GithubUserId'
import { getInstallationOrThrow } from '../entityStore/entities/GithubInstallationEntity'

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

  // Trigger crawling public account
  await sendToEventBridge(appState, EVENTBRIDGE_DETAIL_TYPES.PUBLIC_ACCOUNT_UPDATED, {
    installation: githubAppInstallation,
    publicAccountId: publicAccount.accountId
  })

  return successWith(publicAccount)
}
