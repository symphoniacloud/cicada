import { AppState } from '../../../environment/AppState'
import { dateTimeAddHours } from '../../../util/dateAndTime'
import { processRawRunEventsForWorkflow } from '../githubWorkflowRunEvent'
import { GithubInstallationClient } from '../../../outboundInterfaces/githubInstallationClient'
import { GithubWorkflow } from '../../types/GithubWorkflow'

export async function crawlWorkflowRunEvents(
  appState: AppState,
  workflow: GithubWorkflow,
  lookbackHours: number,
  githubClient: GithubInstallationClient
) {
  const startTime = `${dateTimeAddHours(appState.clock.now(), -1 * lookbackHours).toISOString()}`

  const recentRunEvents = await githubClient.listWorkflowRunsForRepo(
    workflow.accountName,
    workflow.repoName,
    `>${startTime}`
  )
  await processRawRunEventsForWorkflow(appState, workflow, recentRunEvents, false)
}
