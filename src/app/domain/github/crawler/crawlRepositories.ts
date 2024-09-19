import { AppState } from '../../../environment/AppState'
import { GithubInstallation } from '../../types/GithubInstallation'
import { GithubInstallationClient } from '../../../outboundInterfaces/githubInstallationClient'
import { processRawRepositories, toRepositorySummary } from '../githubRepository'
import { ORGANIZATION_ACCOUNT_TYPE, USER_ACCOUNT_TYPE } from '../../types/GithubAccountType'

export async function crawlRepositories(
  appState: AppState,
  installation: GithubInstallation,
  githubClient: GithubInstallationClient
) {
  const latestRawRepositories = await readRawRepositories(installation, githubClient)
  const repos = await processRawRepositories(appState, latestRawRepositories)
  return repos.map(toRepositorySummary)
}

async function readRawRepositories(installation: GithubInstallation, githubClient: GithubInstallationClient) {
  if (installation.accountType === ORGANIZATION_ACCOUNT_TYPE) {
    return await githubClient.listOrganizationRepositories(installation.accountLogin)
  } else if (installation.accountType === USER_ACCOUNT_TYPE) {
    return await githubClient.listInstallationRepositories()
  } else {
    throw new Error(`Unknown installation account type: ${installation.accountType}`)
  }
}
