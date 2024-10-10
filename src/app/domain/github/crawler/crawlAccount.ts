import { AppState } from '../../../environment/AppState'
import { GithubInstallation } from '../../types/GithubInstallation'
import { logger } from '../../../util/logging'
import { crawlUsers } from './crawlUsers'
import {
  GithubInstallationClient,
  publishGithubInstallationClientMetrics
} from '../../../outboundInterfaces/githubInstallationClient'
import { crawlAccountContents } from './crawlAccountContents'
import { GithubPublicAccount, isGithubPublicAccount } from '../../types/GithubPublicAccount'
import { GithubAccountId } from '../../types/GithubAccountId'
import {
  getPublicAccount,
  getPublicAccountsForInstallationAccount
} from '../../entityStore/entities/GithubPublicAccountEntity'
import { getAllInstallations } from '../../entityStore/entities/GithubInstallationEntity'

export async function crawlInstallationAccount(
  appState: AppState,
  installation: GithubInstallation,
  lookbackDays: number
) {
  logger.info(`Crawling Installation for ${installation.accountName}`)
  const githubInstallationClient = appState.githubClient.clientForInstallation(installation.installationId)
  await crawlAccount(appState, githubInstallationClient, installation, lookbackDays)
}

export async function crawlPublicAccount(
  appState: AppState,
  installation: GithubInstallation,
  publicAccountId: GithubAccountId,
  lookbackHours: number
) {
  const githubClient = appState.githubClient.clientForInstallation(installation.installationId)
  const publicAccount = await getPublicAccount(appState.entityStore, installation.accountId, publicAccountId)
  if (publicAccount) {
    await crawlAccount(appState, githubClient, publicAccount, lookbackHours)
  } else {
    logger.error(
      `No public account ${publicAccountId} exists for installation account ${installation.accountId}`
    )
  }
}

export async function crawlPublicAccounts(appState: AppState, lookbackHours: number) {
  // TOEventually - parallelize over all installations by passing installation from Step Functions
  for (const installation of await getAllInstallations(appState.entityStore)) {
    logger.info(`Crawling Public Accounts for ${installation.accountName}`)
    const githubInstallationClient = appState.githubClient.clientForInstallation(installation.installationId)

    const publicAccounts = await getPublicAccountsForInstallationAccount(
      appState.entityStore,
      installation.accountId
    )
    for (const account of publicAccounts) {
      await crawlAccount(appState, githubInstallationClient, account, lookbackHours)
    }
  }
}

export async function crawlAccount(
  appState: AppState,
  githubClient: GithubInstallationClient,
  account: GithubPublicAccount | GithubInstallation,
  lookbackHours: number
) {
  logger.info(`Crawling Account ${account.accountName}`)
  // TODO - crawl users but not memberships for public accounts
  if (!isGithubPublicAccount(account)) {
    await crawlUsers(appState, account, githubClient)
  }
  publishGithubInstallationClientMetrics(githubClient)
  await crawlAccountContents(appState, githubClient, account, lookbackHours)
  publishGithubInstallationClientMetrics(githubClient)
  logger.info('Github Metadata after crawling account', { ...githubClient.meta() })
}
