import { WebhookProcessor } from '../WebhookProcessor.js'
import { AppState } from '../../../../environment/AppState.js'
import { logger } from '../../../../util/logging.js'
import { processRawRunEvent } from '../../githubWorkflowRunEvent.js'
import { getInstallationOrUndefined } from '../../../entityStore/entities/GithubInstallationEntity.js'

import { fromRawGitHubAccountId } from '../../mappings/toFromRawGitHubIds.js'
import { GitHubWebhookWorkflowRunEventSchema } from '../../../../ioTypes/RawGitHubSchemas.js'

export const githubWebhookWorkflowRunProcessor: WebhookProcessor = async (
  appState: AppState,
  body: string
): Promise<void> => {
  const parseResult = GitHubWebhookWorkflowRunEventSchema.safeParse(body)

  if (!parseResult.success) {
    logger.warn('Unexpected workflow_run format - not processing')
    return
  }

  const parsed = parseResult.data.workflow_run

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
