import { processInstallation } from '../githubInstallation.js'
import { AppState } from '../../../environment/AppState.js'
import { removeNullAndUndefined } from '../../../util/collections.js'
import { logger } from '../../../util/logging.js'
import { GitHubInstallation } from '../../../ioTypes/GitHubTypes.js'

import { GithubInstallationFromUnparsedRaw } from '../mappings/FromRawGitHubMappings.js'

export async function crawlInstallations(appState: AppState): Promise<GitHubInstallation[]> {
  logger.info(`Crawling Installations`)

  const fromGitHub = await appState.githubClient.listInstallations()
  const processed = await Promise.all(
    fromGitHub.map(async (raw) => {
      return await processInstallation(appState, GithubInstallationFromUnparsedRaw.parse(raw))
    })
  )
  return removeNullAndUndefined(processed)
}
