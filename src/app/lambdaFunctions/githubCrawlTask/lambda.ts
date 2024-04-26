import { Handler } from 'aws-lambda/handler'
import { AppState } from '../../environment/AppState'
import { lambdaStartup } from '../../environment/lambdaStartup'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware'
import { logger } from '../../util/logging'
import { isFailure } from '../../util/structuredResult'
import { crawlPushes } from '../../domain/github/crawler/crawlPushes'
import { crawlRepositories } from '../../domain/github/crawler/crawlRepositories'
import { crawlInstallations } from '../../domain/github/crawler/crawlInstallations'
import { crawlUsers } from '../../domain/github/crawler/crawlUsers'
import {
  isCrawlEvent,
  isCrawlInstallationsEvent,
  isCrawlPushesEvent,
  isCrawlRepositoriesEvent,
  isCrawlUsersEvent,
  isCrawlWorkflowRunEventsEvent
} from './githubCrawlTaskEvents'
import { crawlWorkflowRunEvents } from '../../domain/github/crawler/crawlRunEvents'

let appState: AppState

export const baseHandler: Handler<unknown, unknown> = async (event) => {
  if (!appState) {
    const startup = await lambdaStartup()
    if (isFailure(startup)) {
      logger.info('Github App not ready, not crawling yet')
      return
    }

    appState = startup.result
  }

  if (!isCrawlEvent(event)) {
    throw new Error('No resourceType field')
  }

  if (isCrawlInstallationsEvent(event)) {
    return await crawlInstallations(appState)
  }

  if (isCrawlUsersEvent(event)) {
    return await crawlUsers(appState, event.installation)
  }

  if (isCrawlRepositoriesEvent(event)) {
    return await crawlRepositories(appState, event.installation)
  }

  if (isCrawlPushesEvent(event)) {
    return await crawlPushes(appState, event.installation, event.repository)
  }

  if (isCrawlWorkflowRunEventsEvent(event)) {
    return await crawlWorkflowRunEvents(appState, event.installation, event.repository, event.lookbackDays)
  }

  throw new Error(`unknown event format: ${event}`)
}

// Entry point - usage is defined by CDK
// noinspection JSUnusedGlobalSymbols
export const handler = middy(baseHandler).use(powertoolsMiddlewares)
