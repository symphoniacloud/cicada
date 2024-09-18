import { AppState } from '../../../environment/AppState'
import { GithubRepositorySummary } from '../../types/GithubRepository'
import { isRawGithubPushEventEvent } from '../../types/rawGithub/RawGithubAPIPushEventEvent'
import { fromRawGithubPushEventEvent, GithubPush } from '../../types/GithubPush'
import { processPushes } from '../githubPush'
import { GithubInstallation } from '../../types/GithubInstallation'
import { logger } from '../../../util/logging'

// TOEventually - only get all pushes back to lookback in crawl configuration, however GitHub doesn't keep
// them around for very long
export async function crawlPushes(
  appState: AppState,
  // the owner ID on repo isn't sufficient when we are crawling public repos from other accounts
  installation: GithubInstallation,
  repo: GithubRepositorySummary
) {
  logger.info(`Crawling Pushes for ${installation.accountLogin}/${repo.name}`)
  const githubClient = appState.githubClient.clientForInstallation(installation.installationId)
  const allEventsForRepo = await githubClient.listMostRecentEventsForRepo(repo.ownerName, repo.name)
  const rawPushes = allEventsForRepo.filter(isRawGithubPushEventEvent)
  // TODO - this comment was from pre-step-functions version. Is there something that can be improved now
  //        repo is in context?
  // For now do translation to internal pushes here since we need context of repo details, which aren't in the raw push
  // (this isn't required for webhook translation)
  const pushes = rawPushes
    .map((push) => fromRawGithubPushEventEvent(repo, push))
    .filter((x: GithubPush | undefined): x is GithubPush => x !== undefined)

  await processPushes(appState, pushes, false)
}
