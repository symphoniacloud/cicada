import { AppState } from '../../../environment/AppState'
import { dateTimeAddHours } from '../../../util/dateAndTime'
import { processRawRunEvents } from '../githubWorkflowRunEvent'
import { GithubInstallationClient } from '../../../outboundInterfaces/githubInstallationClient'
import { GithubRepoSummary } from '../../types/GithubSummaries'

export async function crawlWorkflowRunEvents(
  appState: AppState,
  repo: GithubRepoSummary,
  lookbackHours: number,
  githubClient: GithubInstallationClient
) {
  const startTime = `${dateTimeAddHours(appState.clock.now(), -1 * lookbackHours).toISOString()}`

  const recentRunEvents = await githubClient.listWorkflowRunsForRepo(
    repo.accountName,
    repo.repoName,
    `>${startTime}`
  )
  await processRawRunEvents(appState, recentRunEvents, false)
}
