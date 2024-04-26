import { AppState } from '../../../environment/AppState'
import { GithubRepository } from '../../types/GithubRepository'
import { dateTimeAddDays } from '../../../util/dateAndTime'
import { processRawRunEvents } from '../githubWorkflowRunEvent'
import { GithubInstallation } from '../../types/GithubInstallation'

export async function crawlWorkflowRunEvents(
  appState: AppState,
  // the owner ID on repo isn't sufficient when we are crawling public repos from other accounts
  installation: GithubInstallation,
  repo: GithubRepository,
  lookbackDays: number
) {
  const githubClient = appState.githubClient.clientForInstallation(installation.installationId)
  const startTime = `${dateTimeAddDays(appState.clock.now(), -1 * lookbackDays).toISOString()}`

  const recentRunEvents = await githubClient.listWorkflowRunsForRepo(
    repo.ownerName,
    repo.name,
    `>${startTime}`
  )
  await processRawRunEvents(appState, recentRunEvents, false)
}
