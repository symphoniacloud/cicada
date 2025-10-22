import { AppState } from '../../environment/AppState.js'
import { GithubWorkflowRunEvent } from '../types/GithubWorkflowRunEvent.js'
import { executeAndCatchConditionalCheckFailed } from '../entityStore/entityStoreOperationSupport.js'
import { putGithubWorkflowRunfNoKeyExistsOrNewerThanExisting } from '../entityStore/entities/GithubWorkflowRunEntity.js'
import { saveLatestRunPerWorkflow } from './githubLatestWorkflowRunEvents.js'
import { sortBy } from '../../util/collections.js'
import { workflowRunEventUpdatedTimestamp } from './githubWorkflowRunEvent.js'
import { sendToEventBridge } from '../../outboundInterfaces/eventBridgeBus.js'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../multipleContexts/eventBridge.js'
import { logger } from '../../util/logging.js'

// A workflow run is the same as the most recent workflow run event for a given run ID
export async function saveRuns(
  appState: AppState,
  events: GithubWorkflowRunEvent[],
  publishNotifications: boolean
) {
  async function saveRun(runEvent: GithubWorkflowRunEvent) {
    return await executeAndCatchConditionalCheckFailed(async () => {
      return await putGithubWorkflowRunfNoKeyExistsOrNewerThanExisting(appState.entityStore, runEvent)
    })
  }

  const runs: GithubWorkflowRunEvent[] = []

  // We only want to notify for the most recent event per run, so sort events by most recent first
  // Do this sequentially since if we have multiple events for same
  // run we only want to save the most recent
  for (const event of sortBy(events, workflowRunEventUpdatedTimestamp, false)) {
    // If we haven't already found a run for this event...
    if (!runs.find((run) => event.workflowRunId === run.workflowRunId)) {
      if (await saveRun(event)) {
        // ... then collect saved run
        runs.push(event)
      }
    }
  }

  if (runs.length === 0) return
  logger.info(`Found ${runs.length} new / updated runs`)

  const latestRunsPerWorkflow: GithubWorkflowRunEvent[] = []
  // TODO - need to think about concurrent runs. E.g. if two runs are in progress, one completes, the status is still "in progress"
  // runs is sorted newest first, because of earlier logic in this function
  // Only want to store most recent run per workflows
  for (const run of runs) {
    if (!latestRunsPerWorkflow.find((workflowLatestRun) => workflowLatestRun.workflowId === run.workflowId)) {
      if (await saveLatestRunPerWorkflow(appState, run)) latestRunsPerWorkflow.push(run)
    }
  }

  if (latestRunsPerWorkflow.length === 0) return
  logger.info(`Found ${latestRunsPerWorkflow.length} new / updated latest runs per workflow`)

  for (const run of publishNotifications ? latestRunsPerWorkflow : []) {
    // GitHub sends a 'queued' event, then an 'in_progress' event.
    // As far as notifications are concerned we only for now care about in_progress
    // If we ever get more complete notifications configuration then 'queued' might be one we can allow people to opt-in to
    if (run.status !== 'queued')
      await sendToEventBridge(appState, EVENTBRIDGE_DETAIL_TYPES.GITHUB_NEW_WORKFLOW_RUN_EVENT, run)
  }
}
