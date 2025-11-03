import { AppState } from '../../environment/AppState.js'
import { isSuccess, Result, successWith } from '../../util/structuredResult.js'
import { sendToEventBridge } from '../../outboundInterfaces/eventBridgeBus.js'
import { getInstalledAccountIdForUser } from './githubMembership.js'
import { getInstallationOrThrow } from '../entityStore/entities/GithubInstallationEntity.js'
import { putPublicAccount } from '../entityStore/entities/GithubPublicAccountEntity.js'

import { GitHubInstallation, GitHubPublicAccount, GitHubUserId } from '../../ioTypes/GitHubTypes.js'
import { publicAccountFromRawGithubUser } from './mappings/FromRawGitHubMappings.js'
import { RawGithubUserSchema } from '../../ioTypes/RawGitHubSchemas.js'
import { EVENTBRIDGE_DETAIL_TYPE_PUBLIC_ACCOUNT_UPDATED } from '../../../multipleContexts/eventBridgeSchemas.js'

export async function savePublicAccountWithName(
  appState: AppState,
  adminUserId: GitHubUserId,
  accountName: string
): Promise<Result<GitHubPublicAccount>> {
  // TOEventually - when a user can be a member of multiple installed accounts then need to
  // have them choose which one to add the public account for
  const installationAccountId = await getInstalledAccountIdForUser(appState, adminUserId)
  const githubAppInstallation = await getInstallationOrThrow(appState.entityStore, installationAccountId)
  const unparsedGithubUserResult = await appState.githubClient
    .clientForInstallation(githubAppInstallation.installationId)
    .getUser(accountName)

  if (!isSuccess(unparsedGithubUserResult)) {
    // Return error result
    return unparsedGithubUserResult
  }
  const rawGithubUser = RawGithubUserSchema.parse(unparsedGithubUserResult.result)
  const publicAccount = publicAccountFromRawGithubUser(rawGithubUser, installationAccountId)
  await putPublicAccount(appState.entityStore, publicAccount)

  // Trigger crawling public account
  await sendToEventBridge(appState, EVENTBRIDGE_DETAIL_TYPE_PUBLIC_ACCOUNT_UPDATED, {
    installation: githubAppInstallation,
    publicAccountId: publicAccount.accountId
  })

  return successWith(publicAccount)
}

export function isGitHubPublicAccount(x: GitHubPublicAccount | GitHubInstallation): x is GitHubPublicAccount {
  return Object.hasOwn(x, 'installationAccountId')
}
