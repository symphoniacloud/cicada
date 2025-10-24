import { throwError } from '@symphoniacloud/dynamodb-entity-store'
import {
  CRAWLABLE_RESOURCES,
  CrawlableResource,
  isCrawlableResource
} from '../../../multipleContexts/githubCrawler.js'
import { isNotNullObject } from '../../util/types.js'
import { isGitHubAccountId, isGithubInstallation } from '../../ioTypes/GitHubTypeChecks.js'
import { GitHubAccountId, GitHubInstallation } from '../../ioTypes/GitHubTypes.js'

export type CrawlEvent = { resourceType: CrawlableResource }

export function isCrawlEvent(x: unknown): x is CrawlEvent {
  return isNotNullObject(x) && 'resourceType' in x && isCrawlableResource(x.resourceType)
}

export type CrawlInstallationsEvent = { resourceType: 'installations' }

export type CrawlInstallationEvent = {
  resourceType: 'installation'
  installation: GitHubInstallation
  lookbackDays: number
}

export type CrawlPublicAccountsEvent = {
  resourceType: 'publicAccounts'
  lookbackHours: number
}

export type CrawlPublicAccountEvent = {
  resourceType: 'publicAccount'
  installation: GitHubInstallation
  publicAccountId: GitHubAccountId
  lookbackHours: number
}

export function isCrawlInstallationsEvent(x: CrawlEvent): x is CrawlInstallationsEvent {
  return x.resourceType === CRAWLABLE_RESOURCES.INSTALLATIONS
}

export function isCrawlInstallationEvent(x: CrawlEvent): x is CrawlInstallationEvent {
  if (x.resourceType !== CRAWLABLE_RESOURCES.INSTALLATION) return false
  return (
    ('installation' in x &&
      isGithubInstallation(x.installation) &&
      'lookbackDays' in x &&
      typeof x.lookbackDays === 'number') ||
    throwError(`Invalid object for ${CRAWLABLE_RESOURCES.INSTALLATION} : ${JSON.stringify(x)}`)()
  )
}

export function isCrawlPublicAccountsEvent(x: CrawlEvent): x is CrawlPublicAccountsEvent {
  if (x.resourceType !== CRAWLABLE_RESOURCES.PUBLIC_ACCOUNTS) return false
  return (
    ('lookbackHours' in x && typeof x.lookbackHours === 'number') ||
    throwError(`Invalid object for ${CRAWLABLE_RESOURCES.PUBLIC_ACCOUNTS} : ${JSON.stringify(x)}`)()
  )
}

export function isCrawlPublicAccountEvent(x: CrawlEvent): x is CrawlPublicAccountEvent {
  if (x.resourceType !== CRAWLABLE_RESOURCES.PUBLIC_ACCOUNT) return false
  return (
    ('installation' in x &&
      isGithubInstallation(x.installation) &&
      'publicAccountId' in x &&
      isGitHubAccountId(x.publicAccountId) &&
      'lookbackHours' in x &&
      typeof x.lookbackHours === 'number') ||
    throwError(`Invalid object for ${CRAWLABLE_RESOURCES.PUBLIC_ACCOUNT} : ${JSON.stringify(x)}`)()
  )
}
