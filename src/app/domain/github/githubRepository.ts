import { AppState } from '../../environment/AppState'
import { RawGithubRepository } from '../types/rawGithub/RawGithubRepository'
import { fromRawGithubRepository, GithubRepository } from '../types/GithubRepository'
import { GithubRepositoryEntity } from '../entityStore/entities/GithubRepositoryEntity'
import { GithubInstallation } from '../types/GithubInstallation'
import { crawlRepository } from './crawler/githubRepositoryCrawler'
import { CrawlConfiguration } from './crawler/crawlConfiguration'

export async function processRawRepositories(
  appState: AppState,
  installation: GithubInstallation,
  rawRepos: RawGithubRepository[],
  crawlChildResources: CrawlConfiguration
) {
  await processRepositories(
    appState,
    installation,
    rawRepos.map(fromRawGithubRepository),
    crawlChildResources
  )
}

export async function processRepositories(
  appState: AppState,
  installation: GithubInstallation,
  repos: GithubRepository[],
  crawlConfiguration: CrawlConfiguration
) {
  await saveRepositories(appState, repos)
  // TOEventually - delete repos that don't exist any more
  // TOEventually - figure out what actually changed and just crawl them
  const crawlChildResources =
    crawlConfiguration.crawlChildObjects === 'always' || crawlConfiguration.crawlChildObjects == 'ifChanged'
  for (const repo of crawlChildResources ? repos : []) {
    await crawlRepository(appState, installation, repo, crawlConfiguration)
  }
}

export async function saveRepositories(appState: AppState, repos: GithubRepository[]) {
  // Just put all repos since there may have been updates to details
  await appState.entityStore.for(GithubRepositoryEntity).advancedOperations.batchPut(repos)
}

export async function getRepository(appState: AppState, accountId: number, repoId: number) {
  return appState.entityStore.for(GithubRepositoryEntity).getOrUndefined({ ownerId: accountId, id: repoId })
}
