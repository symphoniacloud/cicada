import { AppState } from '../../../environment/AppState'
import { GithubRepositorySummary } from '../../types/GithubRepository'
import { dateTimeAddHours } from '../../../util/dateAndTime'
import { processRawRunEvents } from '../githubWorkflowRunEvent'
import { GithubInstallationClient } from '../../../outboundInterfaces/githubInstallationClient'

export async function crawlWorkflowRunEvents(
  appState: AppState,
  repo: GithubRepositorySummary,
  lookbackHours: number,
  githubClient: GithubInstallationClient
) {
  const startTime = `${dateTimeAddHours(appState.clock.now(), -1 * lookbackHours).toISOString()}`

  const recentRunEvents = await githubClient.listWorkflowRunsForRepo(
    repo.ownerName,
    repo.name,
    `>${startTime}`
  )
  await processRawRunEvents(appState, recentRunEvents, false)
}
