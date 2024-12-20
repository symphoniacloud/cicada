import { AppState } from '../../../environment/AppState'
import { GithubInstallation } from '../../types/GithubInstallation'
import { GithubInstallationClient } from '../../../outboundInterfaces/githubInstallationClient'
import { processRawUsers } from '../githubUser'
import { ORGANIZATION_ACCOUNT_TYPE, USER_ACCOUNT_TYPE } from '../../types/GithubAccountType'
import { isSuccess } from '../../../util/structuredResult'

export async function crawlUsers(
  appState: AppState,
  installation: GithubInstallation,
  githubClient: GithubInstallationClient
) {
  const latestRawUsers = await readRawUsers(installation, githubClient)
  await processRawUsers(appState, latestRawUsers, installation)
}

async function readRawUsers(installation: GithubInstallation, githubClient: GithubInstallationClient) {
  if (installation.accountType === ORGANIZATION_ACCOUNT_TYPE) {
    return await githubClient.listOrganizationMembers(installation.accountName)
  } else if (installation.accountType === USER_ACCOUNT_TYPE) {
    const getUserResult = await githubClient.getUser(installation.accountName)
    if (isSuccess(getUserResult)) {
      return [getUserResult.result]
    } else {
      throw new Error(getUserResult.reason)
    }
  } else {
    throw new Error(`Unknown installation account type: ${installation.accountType}`)
  }
}
