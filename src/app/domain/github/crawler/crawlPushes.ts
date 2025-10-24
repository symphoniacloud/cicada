import { AppState } from '../../../environment/AppState.js'
import {
  hasTypeForPushEvent,
  isRawGithubPushEventEvent
} from '../../types/rawGithub/RawGithubAPIPushEventEvent.js'
import { fromRawGithubPushEventEvent, GithubPush } from '../../types/GithubPush.js'
import { processPushes } from '../githubPush.js'
import { GithubInstallationClient } from '../../../outboundInterfaces/githubInstallationClient.js'

import { GitHubRepoSummary } from '../../../types/GitHubTypes.js'

// TOEventually - only get all pushes back to lookback in crawl configuration, however GitHub doesn't keep
// them around for very long
export async function crawlPushes(
  appState: AppState,
  // the owner ID on repo isn't sufficient when we are crawling public repos from other accounts
  repo: GitHubRepoSummary,
  githubClient: GithubInstallationClient
) {
  const allEventsForRepo = await githubClient.listMostRecentEventsForRepo(repo.accountName, repo.repoName)

  // Check just type field first to filter to what should be push events, then do a full type check
  // Do this because we log errors on full type check, but don't want to log errors for
  // non-push events
  const rawPushes = allEventsForRepo.filter(hasTypeForPushEvent).filter(isRawGithubPushEventEvent)
  // TODO - this comment was from pre-step-functions version. Is there something that can be improved now
  //        repo is in context?
  // For now do translation to internal pushes here since we need context of repo details, which aren't in the raw push
  // (this isn't required for webhook translation)
  const pushes = rawPushes
    .map((push) => fromRawGithubPushEventEvent(repo, push))
    .filter((x: GithubPush | undefined): x is GithubPush => x !== undefined)

  await processPushes(appState, pushes, false)
}
