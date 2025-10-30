import { AppState } from '../../../../environment/AppState.js'
import { WebhookProcessor } from '../WebhookProcessor.js'
import { processInstallation } from '../../githubInstallation.js'
import { sendToEventBridge } from '../../../../outboundInterfaces/eventBridgeBus.js'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../../../multipleContexts/eventBridge.js'
import { logger } from '../../../../util/logging.js'
import { TransformedGithubInstallationSchema } from '../../mappings/FromRawGitHubMappings.js'

export const githubWebhookInstallationProcessor: WebhookProcessor = async (
  appState: AppState,
  body: string
): Promise<void> => {
  // TOEventually - need to differentiate sub-types of installation - e.g. deleted
  const rawInstallation = JSON.parse(body).installation
  const result = TransformedGithubInstallationSchema.safeParse(rawInstallation)

  if (!result.success) {
    logger.warn('Failed to parse installation from webhook', { error: result.error, rawInstallation })
    return
  }

  const installation = result.data
  await processInstallation(appState, installation)
  await sendToEventBridge(appState, EVENTBRIDGE_DETAIL_TYPES.INSTALLATION_UPDATED, installation)
}
