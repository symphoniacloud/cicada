import { AppState } from '../../../../environment/AppState.js'
import { WebhookProcessor } from '../WebhookProcessor.js'
import { processInstallation } from '../../githubInstallation.js'
import { sendToEventBridge } from '../../../../outboundInterfaces/eventBridgeBus.js'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../../../multipleContexts/eventBridge.js'
import { gitHubInstallationFromRaw } from '../../mappings/FromRawGitHubMappings.js'
import { RawGithubInstallationSchema } from '../../../../ioTypes/RawGitHubSchemas.js'

export const githubWebhookInstallationProcessor: WebhookProcessor = async (
  appState: AppState,
  body: string
): Promise<void> => {
  // TOEventually - need to differentiate sub-types of installation - e.g. deleted
  // TODO - use Zod here, since .installation might not exist in error situations
  const unparsed = JSON.parse(body).installation
  const installation = gitHubInstallationFromRaw(RawGithubInstallationSchema.parse(unparsed))
  await processInstallation(appState, installation)
  await sendToEventBridge(appState, EVENTBRIDGE_DETAIL_TYPES.INSTALLATION_UPDATED, installation)
}
