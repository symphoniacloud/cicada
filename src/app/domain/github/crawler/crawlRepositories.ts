import { AppState } from '../../../environment/AppState'
import { GithubInstallation } from '../../types/GithubInstallation'
import {
  GithubInstallationClient,
  publishGithubInstallationClientMetrics
} from '../../../outboundInterfaces/githubInstallationClient'
import { processRawRepositories } from '../githubRepository'
import { ORGANIZATION_ACCOUNT_TYPE } from '../../types/GithubAccountType'
import { GithubPublicAccount } from '../../types/GithubPublicAccount'
import { RawGithubRepository } from '../../types/rawGithub/RawGithubRepository'
import { crawlPushes } from './crawlPushes'
import { crawlWorkflowRunEvents } from './crawlRunEvents'
import { logger } from '../../../util/logging'

export async function crawlRepositories(
  appState: AppState,
  installation: GithubInstallation,
  githubClient: GithubInstallationClient,
  lookbackHours: number
) {
  const rawRepos =
    installation.accountType === ORGANIZATION_ACCOUNT_TYPE
      ? await githubClient.listOrganizationRepositories(installation.accountLogin)
      : await githubClient.listInstallationRepositories()

  await processReposAndCrawlElements(appState, githubClient, rawRepos, lookbackHours)
}

export async function crawlRepositoriesForPublicAccount(
  appState: AppState,
  githubClient: GithubInstallationClient,
  account: GithubPublicAccount,
  lookbackHours: number
) {
  const rawRepos =
    account.accountType === ORGANIZATION_ACCOUNT_TYPE
      ? await githubClient.listOrganizationRepositories(account.username)
      : await githubClient.listPublicRepositoriesForUser(account.username)

  await processReposAndCrawlElements(appState, githubClient, rawRepos, lookbackHours)
}

async function processReposAndCrawlElements(
  appState: AppState,
  githubClient: GithubInstallationClient,
  rawRepos: RawGithubRepository[],
  lookbackHours: number
) {
  const repos = await processRawRepositories(appState, rawRepos)
  // Eventually consider doing some parallelization here (or move back to step functions) but
  // need to be careful since GitHub gets twitchy about concurrent requests to the API
  // Their "best practice" doc says don't do it, but their rate limit doc says it's supported
  // Only really need to care if things start getting slow
  for (const repo of repos) {
    await crawlPushes(appState, repo, githubClient)
    await crawlWorkflowRunEvents(appState, repo, lookbackHours, githubClient)
  }

  publishGithubInstallationClientMetrics(githubClient)
  logger.info('Github Metadata after crawling repositories', { ...githubClient.meta() })
}
