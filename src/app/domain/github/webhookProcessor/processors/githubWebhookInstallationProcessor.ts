import { AppState } from '../../../../environment/AppState.js'
import { WebhookProcessor } from '../WebhookProcessor.js'
import { processInstallationAndTriggerInstallationCrawl } from '../../githubInstallation.js'
import { gitHubInstallationFromRaw } from '../../mappings/FromRawGitHubMappings.js'
import { GitHubWebhookInstallationSchema } from '../../../../ioTypes/GitHubWebhookSchemas.js'

export const githubWebhookInstallationProcessor: WebhookProcessor = async (
  appState: AppState,
  body: string
): Promise<void> => {
  // TOEventually - need to differentiate sub-types of installation event - e.g. deleted
  const parsed = GitHubWebhookInstallationSchema.parse(body)
  const installation = gitHubInstallationFromRaw(parsed.installation)
  await processInstallationAndTriggerInstallationCrawl(appState, installation)
}
