import { AppState } from '../../../environment/AppState'
import { GithubInstallation } from '../../types/GithubInstallation'
import { logger } from '../../../util/logging'
import { crawlUsers } from './crawlUsers'
import {
  GithubInstallationClient,
  publishGithubInstallationClientMetrics
} from '../../../outboundInterfaces/githubInstallationClient'
import { crawlRepositories, crawlRepositoriesForPublicAccount } from './crawlRepositories'
import { GithubAccountId } from '../../types/GithubKeys'
import { getPublicAccount } from '../../entityStore/entities/GithubPublicAccountEntity'
import { GithubPublicAccount } from '../../types/GithubPublicAccount'

export async function crawlInstallationAccount(
  appState: AppState,
  githubClient: GithubInstallationClient,
  installation: GithubInstallation,
  lookbackDays: number
) {
  await crawlUsers(appState, installation, githubClient)
  publishGithubInstallationClientMetrics(githubClient)
  await crawlRepositories(appState, installation, githubClient, lookbackDays * 24)
}

export async function topLevelCrawlPublicAccount(
  appState: AppState,
  installation: GithubInstallation,
  publicAccountId: GithubAccountId,
  lookbackHours: number
) {
  const githubClient = appState.githubClient.clientForInstallation(installation.installationId)
  const publicAccount = await getPublicAccount(appState.entityStore, installation.accountId, publicAccountId)
  if (!publicAccount) {
    logger.error(
      `Unable to crawl public account - no public account ${publicAccountId} exists for installation account ${installation.accountId}`
    )
    return
  }

  await crawlPublicAccount(appState, githubClient, publicAccount, lookbackHours)
}

export async function crawlPublicAccount(
  appState: AppState,
  githubClient: GithubInstallationClient,
  account: GithubPublicAccount,
  lookbackHours: number
) {
  logger.info(`Crawling Public Account ${account.accountLogin}`)
  // TODO - crawl users but not memberships
  await crawlRepositoriesForPublicAccount(appState, githubClient, account, lookbackHours)
}
