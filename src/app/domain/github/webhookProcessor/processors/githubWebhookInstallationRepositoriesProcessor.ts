import { AppState } from '../../../../environment/AppState.js'
import { WebhookProcessor } from '../WebhookProcessor.js'
import { GitHubWebhookInstallationRepositoriesSchema } from '../../../../ioTypes/GitHubWebhookSchemas.js'
import { logger } from '../../../../util/logging.js'
import { gitHubInstallationFromRaw } from '../../mappings/FromRawGitHubMappings.js'
import { sendToEventBridge } from '../../../../outboundInterfaces/eventBridgeBus.js'
import { EVENTBRIDGE_DETAIL_TYPE_INSTALLATION_REQUIRES_CRAWLING } from '../../../../../multipleContexts/eventBridgeSchemas.js'

export const githubWebhookInstallationRepositoriesProcessor: WebhookProcessor = async (
  appState: AppState,
  body: string
): Promise<void> => {
  const parsed = GitHubWebhookInstallationRepositoriesSchema.parse(body)
  const installation = gitHubInstallationFromRaw(parsed.installation)

  logger.info(
    `Processing installation_repositories.${parsed.action} event for ${installation.accountName} - triggering installation crawl`
  )

  await sendToEventBridge(appState, EVENTBRIDGE_DETAIL_TYPE_INSTALLATION_REQUIRES_CRAWLING, {
    installation,
    lookbackDays: 2
  })
}
