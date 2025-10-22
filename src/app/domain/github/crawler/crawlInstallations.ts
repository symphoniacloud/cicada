import { processRawInstallation } from '../githubInstallation.js'
import { AppState } from '../../../environment/AppState.js'
import { removeNullAndUndefined } from '../../../util/collections.js'
import { GithubInstallation } from '../../types/GithubInstallation.js'
import { logger } from '../../../util/logging.js'

export async function crawlInstallations(appState: AppState): Promise<GithubInstallation[]> {
  logger.info(`Crawling Installations`)
  const installations = await appState.githubClient.listInstallations()

  return removeNullAndUndefined(
    await Promise.all(installations.map(async (raw) => processRawInstallation(appState, raw)))
  )
}
