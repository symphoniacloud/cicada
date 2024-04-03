import { AppState } from '../../../environment/AppState'
import { GithubInstallation } from '../../types/GithubInstallation'
import { processRawUsers } from '../githubUser'
import { ORGANIZATION_ACCOUNT_TYPE, USER_ACCOUNT_TYPE } from '../../types/githubCommonTypes'
import { processRawRepositories } from '../githubRepository'
import { GithubInstallationClient } from '../../../outboundInterfaces/githubInstallationClient'
import { CrawlConfiguration } from './crawlConfiguration'

export async function crawlInstallation(
  appState: AppState,
  installation: GithubInstallation,
  crawlConfiguration: CrawlConfiguration
) {
  const githubClient = appState.githubClient.clientForInstallation(installation.installationId)
  await crawlUsers(appState, installation, githubClient)
  await crawlRepositories(appState, installation, githubClient, crawlConfiguration)
}

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

export async function crawlRepositories(
  appState: AppState,
  installation: GithubInstallation,
  githubClient: GithubInstallationClient,
  crawlConfiguration: CrawlConfiguration
) {
  const latestRawRepositories = await readRawRepositories(installation, githubClient)
  await processRawRepositories(appState, installation, latestRawRepositories, crawlConfiguration)
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
