import { AppState } from '../../../environment/AppState'
import { processRawInstallation } from '../githubInstallation'
import { CrawlConfiguration } from './crawlConfiguration'
import { logger } from '../../../util/logging'

export async function crawlGithubApp(appState: AppState, crawlConfiguration: CrawlConfiguration) {
  logger.info(`Crawling GitHub app`, { ...crawlConfiguration })

  for (const rawInstallation of await appState.githubClient.listInstallations()) {
    await processRawInstallation(appState, rawInstallation, crawlConfiguration)
  }
}
