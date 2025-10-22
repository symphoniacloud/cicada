import { AppState } from '../../../environment/AppState.js'
import { GithubInstallation } from '../../types/GithubInstallation.js'
import { GithubInstallationClient } from '../../../outboundInterfaces/githubInstallationClient.js'
import { processRawRepositories } from '../githubRepo.js'
import { ORGANIZATION_ACCOUNT_TYPE } from '../../types/GithubAccountType.js'
import { GithubPublicAccount, isGithubPublicAccount } from '../../types/GithubPublicAccount.js'
import { crawlPushes } from './crawlPushes.js'
import { crawlWorkflows } from './crawlWorkflows.js'
import { logger } from '../../../util/logging.js'
import { dateTimeAddHours } from '../../../util/dateAndTime.js'
import { GithubRepoSummary, GithubWorkflowSummary } from '../../types/GithubSummaries.js'
import { processRawRunEvents } from '../githubWorkflowRunEvent.js'

export async function crawlAccountContents(
  appState: AppState,
  githubClient: GithubInstallationClient,
  account: GithubPublicAccount | GithubInstallation,
  lookbackHours: number
) {
  logger.info(`Crawling account contents of ${account.accountName}`)
  const rawRepos =
    account.accountType === ORGANIZATION_ACCOUNT_TYPE
      ? await githubClient.listOrganizationRepositories(account.accountName)
      : isGithubPublicAccount(account)
        ? await githubClient.listPublicRepositoriesForUser(account.accountName)
        : await githubClient.listInstallationRepositories()

  // Eventually consider doing some parallelization here (or move back to step functions) but
  // need to be careful since GitHub gets twitchy about concurrent requests to the API
  // Their "best practice" doc says don't do it, but their rate limit doc says it's supported
  // Only really need to care if things start getting slow
  const startTime = `${dateTimeAddHours(appState.clock.now(), -1 * lookbackHours).toISOString()}`
  for (const repo of await processRawRepositories(appState, rawRepos)) {
    await crawlRepoContents(appState, githubClient, repo, startTime)
  }
}

export async function crawlRepoContents(
  appState: AppState,
  githubClient: GithubInstallationClient,
  repo: GithubRepoSummary,
  startTime: string
) {
  logger.info(`Crawling repo contents of ${repo.accountName}/${repo.repoName}`)

  const workflows = await crawlWorkflows(appState, githubClient, repo)
  await crawlRunEvents(appState, githubClient, workflows, startTime)
  await crawlPushes(appState, repo, githubClient)
}

async function crawlRunEvents(
  appState: AppState,
  githubClient: GithubInstallationClient,
  workflows: GithubWorkflowSummary[],
  startTime: string
) {
  if (workflows.length === 0) {
    logger.info(`Not crawling run events - no workflows for this repo`)
    return
  }
  logger.info(`Crawling run events for ${workflows.length} workflows`)
  const rawRunEvents = await githubClient.listWorkflowRunsForRepo(
    workflows[0].accountName,
    workflows[0].repoName,
    `>${startTime}`
  )
  await processRawRunEvents(appState, workflows, rawRunEvents, false)
}
