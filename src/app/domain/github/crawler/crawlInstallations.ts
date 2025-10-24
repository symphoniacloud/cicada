import { processRawInstallation } from '../githubInstallation.js'
import { AppState } from '../../../environment/AppState.js'
import { removeNullAndUndefined } from '../../../util/collections.js'
import { logger } from '../../../util/logging.js'
import { GitHubInstallation } from '../../../ioTypes/GitHubTypes.js'

export async function crawlInstallations(appState: AppState): Promise<GitHubInstallation[]> {
  logger.info(`Crawling Installations`)
  const installations = await appState.githubClient.listInstallations()

  return removeNullAndUndefined(
    await Promise.all(installations.map(async (raw) => processRawInstallation(appState, raw)))
  )
}
