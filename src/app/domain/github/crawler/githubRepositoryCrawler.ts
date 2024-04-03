import { AppState } from '../../../environment/AppState'
import { GithubInstallation } from '../../types/GithubInstallation'
import { GithubRepository } from '../../types/GithubRepository'
import { processRawRunEvents } from '../githubWorkflowRunEvent'
import { processPushes } from '../githubPush'
import { GithubInstallationClient } from '../../../outboundInterfaces/githubInstallationClient'
import { dateTimeAddDays } from '../../../util/dateAndTime'
import { isRawGithubPushEventEvent } from '../../types/rawGithub/RawGithubAPIPushEventEvent'
import { fromRawGithubPushEventEvent, GithubPush } from '../../types/GithubPush'
import { CrawlConfiguration } from './crawlConfiguration'

export async function crawlRepository(
  appState: AppState,
  installation: GithubInstallation,
  repo: GithubRepository,
  crawlConfiguration: CrawlConfiguration
) {
  const githubClient = appState.githubClient.clientForInstallation(installation.installationId)
  await crawlRunEvents(appState, githubClient, repo, crawlConfiguration)
  await crawlPushes(appState, githubClient, repo)
}

export async function crawlRunEvents(
  appState: AppState,
  githubClient: GithubInstallationClient,
  repo: GithubRepository,
  crawlConfiguration: CrawlConfiguration
) {
  const startTime = `${dateTimeAddDays(
    appState.clock.now(),
    -1 * crawlConfiguration.lookbackDays
  ).toISOString()}`

  const recentRunEvents = await githubClient.listWorkflowRunsForRepo(
    repo.ownerName,
    repo.name,
    `>${startTime}`
  )
  await processRawRunEvents(appState, recentRunEvents, false)
}

// TOEventually - only get all pushes back to lookback in crawl configuration, however GitHub doesn't keep
// them around for very long
export async function crawlPushes(
  appState: AppState,
  githubClient: GithubInstallationClient,
  repo: GithubRepository
) {
  const allEventsForRepo = await githubClient.listMostRecentEventsForRepo(repo.ownerName, repo.name)
  const rawPushes = allEventsForRepo.filter(isRawGithubPushEventEvent)
  // For now do translation to internal pushes here since we need context of repo details, which aren't in the raw push
  // (this isn't required for webhook translation)
  const pushes = rawPushes
    .map((push) => fromRawGithubPushEventEvent(repo, push))
    .filter((x: GithubPush | undefined): x is GithubPush => x !== undefined)

  await processPushes(appState, pushes, false)
}
