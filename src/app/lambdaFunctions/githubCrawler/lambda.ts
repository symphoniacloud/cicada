import { Handler } from 'aws-lambda'
import { AppState } from '../../environment/AppState.js'
import { lambdaStartup } from '../../environment/lambdaStartup.js'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware.js'
import { logger } from '../../util/logging.js'
import { isFailure } from '../../util/structuredResult.js'
import { crawlInstallations } from '../../domain/github/crawler/crawlInstallations.js'
import {
  isCrawlEvent,
  isCrawlInstallationEvent,
  isCrawlInstallationsEvent,
  isCrawlPublicAccountEvent,
  isCrawlPublicAccountsEvent
} from './githubCrawlerEvents.js'
import {
  crawlInstallationAccount,
  crawlPublicAccount,
  crawlPublicAccounts
} from '../../domain/github/crawler/crawlAccount.js'

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
