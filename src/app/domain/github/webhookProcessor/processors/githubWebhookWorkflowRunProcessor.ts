import { WebhookProcessor } from '../WebhookProcessor.js'
import { AppState } from '../../../../environment/AppState.js'
import { logger } from '../../../../util/logging.js'
import { processRawRunEvent } from '../../githubWorkflowRunEvent.js'
import { getInstallationOrUndefined } from '../../../entityStore/entities/GithubInstallationEntity.js'

import { fromRawGitHubAccountId } from '../../mappings/toFromRawGitHubIds.js'
import { RawGithubWorkflowRunEvent } from '../../../../ioTypes/RawGitHubTypes.js'
import { RawGithubWorkflowRunEventSchema } from '../../../../ioTypes/RawGitHubSchemas.js'

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
    fromRawGitHubAccountId(parsed.repository.owner.id)
  )
  if (!installation) {
    logger.warn('Received Run event but no known installation for run event owner', { parsed })
    return
  }
  const githubClient = appState.githubClient.clientForInstallation(installation.installationId)

  await processRawRunEvent(appState, parsed, githubClient, true)
}

// TODO - use zod for parsing above?
export function isRawGithubWorkflowRunEvent(x: unknown): x is RawGithubWorkflowRunEvent {
  const result = RawGithubWorkflowRunEventSchema.safeParse(x)
  if (!result.success) {
    logger.error('Unexpected structure for RawGithubWorkflowRunEvent', { event: x, error: result.error })
  }
  return result.success
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
