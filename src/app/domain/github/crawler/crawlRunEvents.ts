import { AppState } from '../../../environment/AppState'
import { GithubRepositorySummary } from '../../types/GithubRepository'
import { dateTimeAddDays } from '../../../util/dateAndTime'
import { processRawRunEvents } from '../githubWorkflowRunEvent'
import { GithubInstallation } from '../../types/GithubInstallation'
import { logger } from '../../../util/logging'

export async function crawlWorkflowRunEvents(
  appState: AppState,
  // the owner ID on repo isn't sufficient when we are crawling public repos from other accounts
  installation: GithubInstallation,
  repo: GithubRepositorySummary,
  lookbackDays: number
) {
  logger.info(`Crawling Run Events for ${installation.accountLogin}/${repo.name}`)
  const githubClient = appState.githubClient.clientForInstallation(installation.installationId)
  const startTime = `${dateTimeAddDays(appState.clock.now(), -1 * lookbackDays).toISOString()}`

  const recentRunEvents = await githubClient.listWorkflowRunsForRepo(
    repo.ownerName,
    repo.name,
    `>${startTime}`
  )
  await processRawRunEvents(appState, recentRunEvents, false)
}
