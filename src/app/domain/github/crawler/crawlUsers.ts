import { AppState } from '../../../environment/AppState'
import { GithubInstallation } from '../../types/GithubInstallation'
import { GithubInstallationClient } from '../../../outboundInterfaces/githubInstallationClient'
import { processRawUsers } from '../githubUser'
import { ORGANIZATION_ACCOUNT_TYPE, USER_ACCOUNT_TYPE } from '../../types/GithubAccountType'

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
    return await githubClient.listOrganizationMembers(installation.accountLogin)
  } else if (installation.accountType === USER_ACCOUNT_TYPE) {
    return [await githubClient.getUser(installation.accountLogin)]
  } else {
    throw new Error(`Unknown installation account type: ${installation.accountType}`)
  }
}
