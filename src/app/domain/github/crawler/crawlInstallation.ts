import { AppState } from '../../../environment/AppState'
import { GithubInstallation } from '../../types/GithubInstallation'
import { logger } from '../../../util/logging'
import { crawlInstallationAccount } from './crawlAccount'

export async function crawlInstallation(
  appState: AppState,
  installation: GithubInstallation,
  lookbackDays: number
) {
  logger.info(`Crawling Installation for ${installation.accountName}`)
  const githubInstallationClient = appState.githubClient.clientForInstallation(installation.installationId)
  await crawlInstallationAccount(appState, githubInstallationClient, installation, lookbackDays)
}
