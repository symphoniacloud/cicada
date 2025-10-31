import { AppState } from '../../../../environment/AppState.js'
import { WebhookProcessor } from '../WebhookProcessor.js'
import { processInstallation } from '../../githubInstallation.js'
import { sendToEventBridge } from '../../../../outboundInterfaces/eventBridgeBus.js'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../../../multipleContexts/eventBridge.js'
import { GithubInstallationFromUnparsedRaw } from '../../mappings/FromRawGitHubMappings.js'

export const githubWebhookInstallationProcessor: WebhookProcessor = async (
  appState: AppState,
  body: string
): Promise<void> => {
  // TOEventually - need to differentiate sub-types of installation - e.g. deleted
  const unparsedInstallation = JSON.parse(body).installation

  const parsed = GithubInstallationFromUnparsedRaw.parse(unparsedInstallation)

  await processInstallation(appState, parsed)
  await sendToEventBridge(appState, EVENTBRIDGE_DETAIL_TYPES.INSTALLATION_UPDATED, parsed)
}
