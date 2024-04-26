import { GithubInstallation, isGithubInstallation } from '../../domain/types/GithubInstallation'
import { GithubRepository, isGithubRepository } from '../../domain/types/GithubRepository'
import { throwError } from '@symphoniacloud/dynamodb-entity-store'
import {
  CRAWLABLE_RESOURCES,
  CrawlableResource,
  isCrawlableResource
} from '../../../multipleContexts/githubCrawler'

// TOEventually - safer type checking here

export type CrawlEvent = { resourceType: CrawlableResource }
type CrawlEventWithInstallation = CrawlEvent & { installation: GithubInstallation }
type CrawlEventWithRepository = CrawlEvent & { repository: GithubRepository }

export function isCrawlEvent(x: unknown): x is CrawlEvent {
  return x !== undefined && isCrawlableResource((x as CrawlEvent).resourceType)
}

export function isCrawlEventWithInstallation(x: CrawlEvent): x is CrawlEventWithInstallation {
  const candidate = x as CrawlEventWithInstallation
  return candidate.installation && isGithubInstallation(candidate.installation)
}

export function isCrawlEventWithRepository(x: CrawlEvent): x is CrawlEventWithRepository {
  const candidate = x as CrawlEventWithRepository
  return candidate.repository && isGithubRepository(candidate.repository)
}

export type CrawlInstallationsEvent = { resourceType: 'installations' }
export type CrawlUsersEvent = { resourceType: 'users' } & CrawlEventWithInstallation
export type CrawlRepositoriesEvent = { resourceType: 'repositories' } & CrawlEventWithInstallation
export type CrawlPushesEvent = { resourceType: 'pushes' } & CrawlEventWithInstallation &
  CrawlEventWithRepository
export type CrawlWorkflowRunEventsEvent = {
  resourceType: 'pushes'
  lookbackDays: number
} & CrawlEventWithInstallation &
  CrawlEventWithRepository

export function isCrawlInstallationsEvent(x: CrawlEvent): x is CrawlInstallationsEvent {
  return x.resourceType === CRAWLABLE_RESOURCES.INSTALLATIONS
}

export function isCrawlUsersEvent(x: CrawlEvent): x is CrawlUsersEvent {
  if (x.resourceType !== CRAWLABLE_RESOURCES.USERS) return false
  return (
    isCrawlEventWithInstallation(x) ||
    throwError(`Invalid object for ${CRAWLABLE_RESOURCES.USERS} : ${JSON.stringify(x)}`)()
  )
}

export function isCrawlRepositoriesEvent(x: CrawlEvent): x is CrawlRepositoriesEvent {
  if (x.resourceType !== CRAWLABLE_RESOURCES.REPOSITORIES) return false
  return (
    isCrawlEventWithInstallation(x) ||
    throwError(`Invalid object for ${CRAWLABLE_RESOURCES.REPOSITORIES} : ${JSON.stringify(x)}`)()
  )
}

export function isCrawlPushesEvent(x: CrawlEvent): x is CrawlPushesEvent {
  if (x.resourceType !== CRAWLABLE_RESOURCES.PUSHES) return false
  return (
    (isCrawlEventWithInstallation(x) && isCrawlEventWithRepository(x)) ||
    throwError(`Invalid object for ${CRAWLABLE_RESOURCES.PUSHES} : ${JSON.stringify(x)}`)()
  )
}

export function isCrawlWorkflowRunEventsEvent(x: CrawlEvent): x is CrawlWorkflowRunEventsEvent {
  if (x.resourceType !== CRAWLABLE_RESOURCES.WORKFLOW_RUN_EVENTS) return false
  const hasLookBackDays = typeof (x as CrawlWorkflowRunEventsEvent).lookbackDays !== undefined
  return (
    (hasLookBackDays && isCrawlEventWithInstallation(x) && isCrawlEventWithRepository(x)) ||
    throwError(`Invalid object for ${CRAWLABLE_RESOURCES.WORKFLOW_RUN_EVENTS} : ${JSON.stringify(x)}`)()
  )
}
