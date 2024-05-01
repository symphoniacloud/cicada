import { WebhookProcessor } from '../WebhookProcessor'
import { AppState } from '../../../../environment/AppState'
import { logger } from '../../../../util/logging'
import { isRawGithubWorkflowRunEvent } from '../../../types/rawGithub/RawGithubWorkflowRunEvent'
import { processRawRunEvents } from '../../githubWorkflowRunEvent'

export const githubWebhookWorkflowRunProcessor: WebhookProcessor = async (
  appState: AppState,
  body: string
): Promise<void> => {
  const parsed = parse(body)

  if (!parsed) {
    return
  }
  await processRawRunEvents(appState, [parsed], true)
}

function parse(body: string) {
  const eventDetails = JSON.parse(body)
  const action = eventDetails?.action
  if (!action) {
    logger.warn('No action on body - nothing to process')
    return
  }

  if (action !== 'completed') {
    logger.warn(`Not processing action [${action}] at this time`)
    return
  }

  const workflowRun = eventDetails['workflow_run']
  if (!workflowRun) {
    logger.warn('No workflow_run on body for workflow_run action - nothing to process')
    return
  }

  if (!isRawGithubWorkflowRunEvent(workflowRun)) {
    logger.warn('Unexpected workflow_run format - not processing')
    return
  }

  return workflowRun
}
