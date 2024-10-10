import { Handler } from 'aws-lambda/handler'
import { AppState } from '../../environment/AppState'
import { lambdaStartup } from '../../environment/lambdaStartup'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware'
import { logger } from '../../util/logging'
import { isFailure } from '../../util/structuredResult'
import { crawlInstallations } from '../../domain/github/crawler/crawlInstallations'
import {
  isCrawlEvent,
  isCrawlInstallationEvent,
  isCrawlInstallationsEvent,
  isCrawlPublicAccountEvent,
  isCrawlPublicAccountsEvent
} from './githubCrawlerEvents'
import {
  crawlInstallationAccount,
  crawlPublicAccount,
  crawlPublicAccounts
} from '../../domain/github/crawler/crawlAccount'

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

  if (isCrawlInstallationEvent(event)) {
    return await crawlInstallationAccount(appState, event.installation, event.lookbackDays)
  }

  if (isCrawlPublicAccountsEvent(event)) {
    return await crawlPublicAccounts(appState, event.lookbackHours)
  }

  if (isCrawlPublicAccountEvent(event)) {
    return await crawlPublicAccount(appState, event.installation, event.publicAccountId, event.lookbackHours)
  }

  throw new Error(`unknown event format: ${event}`)
}

// Entry point - usage is defined by CDK
// noinspection JSUnusedGlobalSymbols
export const handler = middy(baseHandler).use(powertoolsMiddlewares)
