import { AppState } from '../../../environment/AppState'
import { GithubInstallation } from '../../types/GithubInstallation'
import { logger } from '../../../util/logging'
import { crawlInstallationAccount, crawlPublicAccount } from './crawlAccount'
import { getPublicAccountsForOwner } from '../../entityStore/entities/GithubPublicAccountEntity'

export async function crawlInstallation(
  appState: AppState,
  installation: GithubInstallation,
  lookbackDays: number
) {
  logger.info(`Crawling Installation for ${installation.accountLogin}`)
  const githubInstallationClient = appState.githubClient.clientForInstallation(installation.installationId)
  await crawlInstallationAccount(appState, githubInstallationClient, installation, lookbackDays)

  // TODO - Is this going to be necessary if we crawl public accounts every hour?
  const publicAccounts = await getPublicAccountsForOwner(appState.entityStore, installation.accountId)
  for (const account of publicAccounts) {
    await crawlPublicAccount(appState, githubInstallationClient, account, lookbackDays)
  }
}
