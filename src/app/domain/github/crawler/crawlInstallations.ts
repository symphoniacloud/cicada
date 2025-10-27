import { processRawInstallation } from '../githubInstallation.js'
import { AppState } from '../../../environment/AppState.js'
import { removeNullAndUndefined } from '../../../util/collections.js'
import { logger } from '../../../util/logging.js'
import { GitHubInstallation } from '../../../ioTypes/GitHubTypes.js'
import { RawGithubInstallationSchema } from '../../types/rawGithub/RawGithubInstallation.js'

export async function crawlInstallations(appState: AppState): Promise<GitHubInstallation[]> {
  logger.info(`Crawling Installations`)
  const raw = await appState.githubClient.listInstallations()
  const installations = raw.map((rawI) => RawGithubInstallationSchema.parse(rawI))

  return removeNullAndUndefined(
    await Promise.all(installations.map(async (raw) => processRawInstallation(appState, raw)))
  )
}
