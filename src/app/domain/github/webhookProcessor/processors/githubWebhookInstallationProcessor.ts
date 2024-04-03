import { fromRawGithubInstallation } from '../../../types/GithubInstallation'
import { RawGithubInstallation } from '../../../types/rawGithub/RawGithubInstallation'
import { processInstallation } from '../../githubInstallation'
import { AppState } from '../../../../environment/AppState'
import { WebhookProcessor } from '../WebhookProcessor'

export const githubWebhookInstallationProcessor: WebhookProcessor = async (
  appState: AppState,
  body: string
): Promise<void> => {
  // TOEventually - need to differentiate sub-types of installation - e.g. deleted
  // TOEventually - type check, e.g. with AJV
  const parsed = fromRawGithubInstallation(JSON.parse(body).installation as RawGithubInstallation)
  if (!parsed) {
    return
  }
  await processInstallation(appState, parsed, {
    crawlChildObjects: 'ifChanged',
    lookbackDays: 90
  })
}
