import { AppState } from '../../../../environment/AppState.js'
import { WebhookProcessor } from '../WebhookProcessor.js'
import { processInstallation } from '../../githubInstallation.js'
import { sendToEventBridge } from '../../../../outboundInterfaces/eventBridgeBus.js'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../../../multipleContexts/eventBridge.js'
import { gitHubInstallationFromRaw } from '../../mappings/FromRawGitHubMappings.js'
import { GitHubWebhookInstallationSchema } from '../../../../ioTypes/GitHubWebhookSchemas.js'

export const githubWebhookInstallationProcessor: WebhookProcessor = async (
  appState: AppState,
  body: string
): Promise<void> => {
  // TOEventually - need to differentiate sub-types of installation event - e.g. deleted
  const parsed = GitHubWebhookInstallationSchema.parse(body)
  const installation = gitHubInstallationFromRaw(parsed.installation)
  await processInstallation(appState, installation)
  await sendToEventBridge(appState, EVENTBRIDGE_DETAIL_TYPES.INSTALLATION_UPDATED, installation)
}
