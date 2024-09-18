import { GithubInstallation, isGithubInstallation } from '../../domain/types/GithubInstallation'
import { throwError } from '@symphoniacloud/dynamodb-entity-store'
import {
  CRAWLABLE_RESOURCES,
  CrawlableResource,
  isCrawlableResource
} from '../../../multipleContexts/githubCrawler'
import { isNotNullObject } from '../../util/types' // TOEventually - safer type checking here

export type CrawlEvent = { resourceType: CrawlableResource }

export function isCrawlEvent(x: unknown): x is CrawlEvent {
  return isNotNullObject(x) && 'resourceType' in x && isCrawlableResource(x.resourceType)
}

export type CrawlInstallationsEvent = { resourceType: 'installations' }

export type CrawlInstallationEvent = {
  resourceType: 'installation'
  installation: GithubInstallation
  lookbackDays: number
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
