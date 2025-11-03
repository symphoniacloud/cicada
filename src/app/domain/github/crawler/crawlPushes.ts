import { AppState } from '../../../environment/AppState.js'
import { processPushes } from '../githubPush.js'
import { GithubInstallationClient } from '../../../outboundInterfaces/githubInstallationClient.js'

import { GitHubRepoSummary } from '../../../ioTypes/GitHubTypes.js'
import { RawGithubEventSchema, RawGithubPushFromApiSchema } from '../../../ioTypes/RawGitHubSchemas.js'
import { fromRawGithubPushFromApi } from '../mappings/FromRawGitHubMappings.js'

// TOEventually - only get all pushes back to lookback in crawl configuration, but GitHub doesn't keep
// them around for very long anyway
export async function crawlPushes(
  appState: AppState,
  // the owner ID on repo isn't sufficient when we are crawling public repos from other accounts
  repo: GitHubRepoSummary,
  githubClient: GithubInstallationClient
) {
  const allEventsForRepo = await githubClient.listMostRecentEventsForRepo(repo.accountName, repo.repoName)

  const pushes = allEventsForRepo
    // Just do a very simple parse first so we can filter down to Push Events
    .map((x) => RawGithubEventSchema.parse(x))
    .filter((x) => x.type === 'PushEvent')
    // Now do full parse
    .map((x) => RawGithubPushFromApiSchema.parse(x))
    .map((push) => fromRawGithubPushFromApi(repo, push))

  await processPushes(appState, pushes, false)
}
