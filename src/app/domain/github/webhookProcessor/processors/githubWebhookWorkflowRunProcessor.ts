import { WebhookProcessor } from '../WebhookProcessor.js'
import { AppState } from '../../../../environment/AppState.js'
import { logger } from '../../../../util/logging.js'
import { processRawRunEvent } from '../../githubWorkflowRunEvent.js'
import { getInstallationOrUndefined } from '../../../entityStore/entities/GithubInstallationEntity.js'

import { fromRawGitHubAccountId } from '../../mappings/toFromRawGitHubIds.js'

import { GitHubWebhookWorkflowRunEventSchema } from '../../../../ioTypes/GitHubWebhookSchemas.js'

export const githubWebhookWorkflowRunProcessor: WebhookProcessor = async (
  appState: AppState,
  body: string
): Promise<void> => {
  const rawWorkflowRun = GitHubWebhookWorkflowRunEventSchema.parse(body).workflow_run

  const installation = await getInstallationOrUndefined(
    appState.entityStore,
    fromRawGitHubAccountId(rawWorkflowRun.repository.owner.id)
  )
  if (!installation) {
    logger.warn('Received Run event but no known installation for run event owner', { rawWorkflowRun })
    return
  }

  const githubClient = appState.githubClient.clientForInstallation(installation.installationId)
  await processRawRunEvent(appState, rawWorkflowRun, githubClient, true)
}
