import { Handler } from 'aws-lambda/handler'
import { AppState } from '../../environment/AppState'
import { lambdaStartup } from '../../environment/lambdaStartup'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware'
import { crawlGithubApp } from '../../domain/github/crawler/githubAppCrawler'
import { logger } from '../../util/logging'
import { isFailure } from '../../util/structuredResult'

let appState: AppState

export const baseHandler: Handler<unknown, void> = async (event) => {
  if (!appState) {
    const startup = await lambdaStartup()
    if (isFailure(startup)) {
      logger.info('Github App not ready, not crawling yet')
      return
    }

    appState = startup.result
  }

  await crawlGithubApp(appState, {
    crawlChildObjects: 'always',
    lookbackDays: isEventWithLookbackDays(event) ? event.lookbackDays : 3
  })
}

function isEventWithLookbackDays(x: unknown): x is { lookbackDays: number } {
  return x !== null && typeof x === 'object' && 'lookbackDays' in x && typeof x.lookbackDays === 'number'
}

// Entry point - usage is defined by CDK
// noinspection JSUnusedGlobalSymbols
export const handler = middy(baseHandler).use(powertoolsMiddlewares)
