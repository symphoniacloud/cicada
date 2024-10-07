import { AppState } from '../../../environment/AppState'
import { GithubInstallation } from '../../types/GithubInstallation'
import {
  GithubInstallationClient,
  publishGithubInstallationClientMetrics
} from '../../../outboundInterfaces/githubInstallationClient'
import { processRawRepositories } from '../githubRepo'
import { ORGANIZATION_ACCOUNT_TYPE } from '../../types/GithubAccountType'
import { GithubPublicAccount } from '../../types/GithubPublicAccount'
import { RawGithubRepo } from '../../types/rawGithub/RawGithubRepo'
import { crawlPushes } from './crawlPushes'
import { crawlWorkflows } from './crawlWorkflows'
import { logger } from '../../../util/logging'

export async function crawlRepositories(
  appState: AppState,
  installation: GithubInstallation,
  githubClient: GithubInstallationClient,
  lookbackHours: number
) {
  const rawRepos =
    installation.accountType === ORGANIZATION_ACCOUNT_TYPE
      ? await githubClient.listOrganizationRepositories(installation.accountName)
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
      ? await githubClient.listOrganizationRepositories(account.accountName)
      : await githubClient.listPublicRepositoriesForUser(account.accountName)

  await processReposAndCrawlElements(appState, githubClient, rawRepos, lookbackHours)
}

async function processReposAndCrawlElements(
  appState: AppState,
  githubClient: GithubInstallationClient,
  rawRepos: RawGithubRepo[],
  lookbackHours: number
) {
  const repos = await processRawRepositories(appState, rawRepos)
  // Eventually consider doing some parallelization here (or move back to step functions) but
  // need to be careful since GitHub gets twitchy about concurrent requests to the API
  // Their "best practice" doc says don't do it, but their rate limit doc says it's supported
  // Only really need to care if things start getting slow
  if (repos.length > 0) logger.info(`Processing ${repos.length} repos in account ${repos[0].accountName}`)
  for (const repo of repos) {
    await crawlWorkflows(appState, repo, githubClient, lookbackHours)
    await crawlPushes(appState, repo, githubClient)
  }

  publishGithubInstallationClientMetrics(githubClient)
  logger.info('Github Metadata after crawling repositories', { ...githubClient.meta() })
}
