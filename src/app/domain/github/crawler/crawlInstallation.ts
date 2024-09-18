import { AppState } from '../../../environment/AppState'
import { GithubInstallation } from '../../types/GithubInstallation'
import { crawlUsers } from './crawlUsers'
import { crawlRepositories } from './crawlRepositories'
import { crawlPushes } from './crawlPushes'
import { crawlWorkflowRunEvents } from './crawlRunEvents'
import { logger } from '../../../util/logging'

export async function crawlInstallation(
  appState: AppState,
  installation: GithubInstallation,
  lookbackDays: number
) {
  logger.info(`Crawling Installation for ${installation.accountLogin}`)
  await crawlUsers(appState, installation)
  const repos = await crawlRepositories(appState, installation)
  // Eventually consider doing some parallelization here (or move back to step function) but
  // need to be careful since GitHub gets twitchy about concurrent requests to the API
  // Their "best practice" doc says don't do it, but their rate limit doc says it's supported
  // Only really need to care if things start getting slow
  for (const repo of repos) {
    await crawlPushes(appState, installation, repo)
    await crawlWorkflowRunEvents(appState, installation, repo, lookbackDays)
  }
}
