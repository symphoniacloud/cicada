import { WebhookProcessor } from '../WebhookProcessor'
import { AppState } from '../../../../environment/AppState'
import { logger } from '../../../../util/logging'
import { isRawGithubWorkflowRunEvent } from '../../../types/rawGithub/RawGithubWorkflowRunEvent'
import { processRawRunEvent } from '../../githubWorkflowRunEvent'
import { getInstallationOrUndefined } from '../../../entityStore/entities/GithubInstallationEntity'
import { fromRawGithubAccountId } from '../../../types/GithubAccountId'

export const githubWebhookWorkflowRunProcessor: WebhookProcessor = async (
  appState: AppState,
  body: string
): Promise<void> => {
  const parsed = parse(body)

  if (!parsed) {
    return
  }

  const installation = await getInstallationOrUndefined(
    appState.entityStore,
    fromRawGithubAccountId(parsed.repository.owner.id)
  )
  if (!installation) {
    logger.warn('Received Run event but no known installation for run event owner', { parsed })
    return
  }
  const githubClient = appState.githubClient.clientForInstallation(installation.installationId)

  await processRawRunEvent(appState, parsed, githubClient, true)
}

function parse(body: string) {
  const eventDetails = JSON.parse(body)
  const action = eventDetails?.action
  if (!action) {
    logger.warn('No action on body - nothing to process')
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
