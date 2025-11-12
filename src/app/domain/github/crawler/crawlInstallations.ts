import { processInstallationAndTriggerInstallationCrawl } from '../githubInstallation.js'
import { AppState } from '../../../environment/AppState.js'
import { logger } from '../../../util/logging.js'

import { gitHubInstallationFromRaw } from '../mappings/FromRawGitHubMappings.js'
import { RawGithubInstallationSchema } from '../../../ioTypes/RawGitHubSchemas.js'

export async function crawlInstallations(appState: AppState) {
  logger.info(`Crawling Installations`)

  const installations = (await appState.githubClient.listInstallations())
    .map((x) => RawGithubInstallationSchema.parse(x))
    .map(gitHubInstallationFromRaw)

  for (const installation of installations) {
    await processInstallationAndTriggerInstallationCrawl(appState, installation)
  }
}
