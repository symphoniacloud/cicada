import { processInstallation } from '../githubInstallation.js'
import { AppState } from '../../../environment/AppState.js'
import { removeNullAndUndefined } from '../../../util/collections.js'
import { logger } from '../../../util/logging.js'
import { GitHubInstallation } from '../../../ioTypes/GitHubTypes.js'

import { GithubInstallationFromUnparsedRaw } from '../mappings/FromRawGitHubMappings.js'

export async function crawlInstallations(appState: AppState): Promise<GitHubInstallation[]> {
  logger.info(`Crawling Installations`)

  const fromGitHub = await appState.githubClient.listInstallations()
  const parsed = fromGitHub.map(parseRawGithub)
  return removeNullAndUndefined(
    await Promise.all(parsed.map(async (installation) => processInstallation(appState, installation)))
  )
}

function parseRawGithub(x: unknown): GitHubInstallation {
  return GithubInstallationFromUnparsedRaw.parse(x)
}
