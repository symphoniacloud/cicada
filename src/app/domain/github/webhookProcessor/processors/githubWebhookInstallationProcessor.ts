import { fromRawGithubInstallation } from '../../../types/GithubInstallation.js'
import { RawGithubInstallation } from '../../../types/rawGithub/RawGithubInstallation.js'
import { AppState } from '../../../../environment/AppState.js'
import { WebhookProcessor } from '../WebhookProcessor.js'
import { processInstallation } from '../../githubInstallation.js'
import { sendToEventBridge } from '../../../../outboundInterfaces/eventBridgeBus.js'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../../../multipleContexts/eventBridge.js'

export const githubWebhookInstallationProcessor: WebhookProcessor = async (
  appState: AppState,
  body: string
): Promise<void> => {
  // TOEventually - need to differentiate sub-types of installation - e.g. deleted
  // TOEventually - type check, e.g. with AJV
  const installation = fromRawGithubInstallation(JSON.parse(body).installation as RawGithubInstallation)
  if (!installation) {
    return
  }

  await processInstallation(appState, installation)
  await sendToEventBridge(appState, EVENTBRIDGE_DETAIL_TYPES.INSTALLATION_UPDATED, installation)
}
