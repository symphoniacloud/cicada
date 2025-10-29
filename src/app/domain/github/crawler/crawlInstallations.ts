import { processInstallation } from '../githubInstallation.js'
import { AppState } from '../../../environment/AppState.js'
import { removeNullAndUndefined } from '../../../util/collections.js'
import { logger } from '../../../util/logging.js'
import { GitHubInstallation } from '../../../ioTypes/GitHubTypes.js'
import { TransformedGithubInstallationSchema } from '../../types/rawGithub/RawGithubInstallation.js'

export async function crawlInstallations(appState: AppState): Promise<GitHubInstallation[]> {
  logger.info(`Crawling Installations`)

  const installationsFromGitHub = await appState.githubClient.listInstallations()
  return removeNullAndUndefined(
    await Promise.all(
      installationsFromGitHub
        .map((rawI) => TransformedGithubInstallationSchema.parse(rawI))
        .map(async (installation) => processInstallation(appState, installation))
    )
  )
}
