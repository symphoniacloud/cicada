import { AppState } from '../../../environment/AppState'
import { logger } from '../../../util/logging'
import { crawlPublicAccount } from './crawlAccount'
import { getPublicAccountsForOwner } from '../../entityStore/entities/GithubPublicAccountEntity'
import { getAllInstallations } from '../githubInstallation'

export async function crawlPublicAccounts(appState: AppState, lookbackHours: number) {
  // TOEventually - parallelize over all installations by passing installation from Step Functions
  for (const installation of await getAllInstallations(appState)) {
    logger.info(`Crawling Public Accounts for ${installation.accountLogin}`)
    const githubInstallationClient = appState.githubClient.clientForInstallation(installation.installationId)

    const publicAccounts = await getPublicAccountsForOwner(appState.entityStore, installation.accountId)
    for (const account of publicAccounts) {
      await crawlPublicAccount(appState, githubInstallationClient, account, lookbackHours)
    }
  }
}
