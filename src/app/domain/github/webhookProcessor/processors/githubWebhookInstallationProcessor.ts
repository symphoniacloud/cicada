import { fromRawGithubInstallation } from '../../../types/GithubInstallation'
import { RawGithubInstallation } from '../../../types/rawGithub/RawGithubInstallation'
import { AppState } from '../../../../environment/AppState'
import { WebhookProcessor } from '../WebhookProcessor'
import { processInstallation } from '../../githubInstallation'
import { sendToEventBridge } from '../../../../outboundInterfaces/eventBridgeBus'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../../../multipleContexts/eventBridge'

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
