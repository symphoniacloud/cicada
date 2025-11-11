import { WebhookProcessor } from '../WebhookProcessor.js'
import { AppState } from '../../../../environment/AppState.js'
import { processPushes } from '../../githubPush.js'
import { fromRawGithubPushFromWebhook } from '../../mappings/FromRawGitHubMappings.js'
import { GitHubWebhookPushWithPossibleNoHeadSchema } from '../../../../ioTypes/GitHubWebhookSchemas.js'
import { logger } from '../../../../util/logging.js'
import { RawGithubPushFromWebhookSchema } from '../../../../ioTypes/RawGitHubSchemas.js'

export const githubWebhookRepoPushProcessor: WebhookProcessor = async (
  appState: AppState,
  body: string
): Promise<void> => {
  const rawParsedResult = GitHubWebhookPushWithPossibleNoHeadSchema.safeParse(body)
  if (rawParsedResult.error) {
    logger.error(rawParsedResult.error.message, { error: rawParsedResult.error })
    throw new Error(rawParsedResult.error.message)
  }
  const withPossibleNoHead = rawParsedResult.data
  // GitHub will sometimes send a push with no head commit, e.g. if a branch is deleted
  //  Right now we need a SHA to differentiate pushes, so just ignore such pushes for now
  if (!withPossibleNoHead?.head_commit) {
    logger.info('Received webhook push with no head commit - ignoring', { rawPush: withPossibleNoHead })
    return
  }
  const rawParsed = RawGithubPushFromWebhookSchema.parse(withPossibleNoHead)
  await processPushes(appState, [fromRawGithubPushFromWebhook(rawParsed)], true)
}
