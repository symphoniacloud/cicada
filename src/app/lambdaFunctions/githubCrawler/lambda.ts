import { Handler } from 'aws-lambda'
import { AppState } from '../../environment/AppState.js'
import { lambdaStartup } from '../../environment/lambdaStartup.js'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware.js'
import { logger } from '../../util/logging.js'
import { isFailure } from '../../util/structuredResult.js'
import { crawlInstallations } from '../../domain/github/crawler/crawlInstallations.js'
import { CrawlEventSchema } from './githubCrawlerEvents.js'
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

  const parseResult = CrawlEventSchema.safeParse(event)
  if (!parseResult.success) {
    throw new Error(`Invalid crawl event: ${parseResult.error.message}`)
  }

  const crawlEvent = parseResult.data

  switch (crawlEvent.resourceType) {
    case 'installations':
      return await crawlInstallations(appState)

    case 'installation':
      return await crawlInstallationAccount(appState, crawlEvent.installation, crawlEvent.lookbackDays)

    case 'publicAccounts':
      return await crawlPublicAccounts(appState, crawlEvent.lookbackHours)

    case 'publicAccount':
      return await crawlPublicAccount(
        appState,
        crawlEvent.installation,
        crawlEvent.publicAccountId,
        crawlEvent.lookbackHours
      )

    default:
      throw new Error(`Unknown crawl event type ${parseResult.data.resourceType}`)
  }
}

// Entry point - usage is defined by CDK
// noinspection JSUnusedGlobalSymbols
export const handler = middy(baseHandler).use(powertoolsMiddlewares)
