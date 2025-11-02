import { processInstallation } from '../githubInstallation.js'
import { AppState } from '../../../environment/AppState.js'
import { removeNullAndUndefined } from '../../../util/collections.js'
import { logger } from '../../../util/logging.js'
import { GitHubInstallation } from '../../../ioTypes/GitHubTypes.js'

import { gitHubInstallationFromRaw } from '../mappings/FromRawGitHubMappings.js'
import { RawGithubInstallationSchema } from '../../../ioTypes/RawGitHubSchemas.js'

export async function crawlInstallations(appState: AppState): Promise<GitHubInstallation[]> {
  logger.info(`Crawling Installations`)

  const fromGitHub = await appState.githubClient.listInstallations()
  const installations = fromGitHub.map((raw) =>
    gitHubInstallationFromRaw(RawGithubInstallationSchema.parse(raw))
  )
  const processed = await Promise.all(
    installations.map(async (installation) => {
      return await processInstallation(appState, installation)
    })
  )
  return removeNullAndUndefined(processed)
}
