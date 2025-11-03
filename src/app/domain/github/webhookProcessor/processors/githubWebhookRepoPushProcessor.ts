import { WebhookProcessor } from '../WebhookProcessor.js'
import { AppState } from '../../../../environment/AppState.js'
import { processPushes } from '../../githubPush.js'
import { fromRawGithubWebhookPush } from '../../mappings/FromRawGitHubMappings.js'
import { GitHubWebhookPushSchema } from '../../../../ioTypes/GitHubWebhookSchemas.js'

export const githubWebhookRepoPushProcessor: WebhookProcessor = async (
  appState: AppState,
  body: string
): Promise<void> => {
  const rawParsed = GitHubWebhookPushSchema.parse(body)
  await processPushes(appState, [fromRawGithubWebhookPush(rawParsed)], true)
}
