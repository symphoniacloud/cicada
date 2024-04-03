import { Handler } from 'aws-lambda/handler'
import { AppState } from '../../environment/AppState'
import { lambdaStartup } from '../../environment/lambdaStartup'
import middy from '@middy/core'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware'
import { crawlGithubApp } from '../../domain/github/crawler/githubAppCrawler'

let appState: AppState

export const baseHandler: Handler<unknown, void> = async (event) => {
  if (!appState) {
    appState = await lambdaStartup()
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
