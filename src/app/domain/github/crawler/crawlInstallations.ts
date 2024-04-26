import { processRawInstallation } from '../githubInstallation'
import { AppState } from '../../../environment/AppState'
import { removeNullAndUndefined } from '../../../util/collections'
import { GithubInstallation } from '../../types/GithubInstallation'

export async function crawlInstallations(appState: AppState): Promise<GithubInstallation[]> {
  const installations = await appState.githubClient.listInstallations()

  return removeNullAndUndefined(
    await Promise.all(installations.map(async (raw) => processRawInstallation(appState, raw)))
  )
}
