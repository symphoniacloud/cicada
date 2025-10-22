import { AppState } from './AppState.js'
import { realClock } from '../util/dateAndTime.js'
import { createRealGithubClient } from '../outboundInterfaces/githubClient.js'
import { realWebPushWrapper } from '../outboundInterfaces/webPushWrapper.js'
import { realEventBridgeEventBus } from '../outboundInterfaces/eventBridgeBus.js'
import { setupEntityStoreBackedByRealDynamoDB } from '../domain/entityStore/initEntityStore.js'
import { realCicadaConfig } from './config.js'
import { realS3 } from '../outboundInterfaces/s3Wrapper.js'
import { consoleLogger, EntityStoreLogger } from '@symphoniacloud/dynamodb-entity-store'
import { throwFunction } from '../../multipleContexts/errors.js'
import { githubAppIsReady } from '../domain/github/setup/githubAppReadyCheck.js'
import { failedWith, Result, successWith } from '../util/structuredResult.js'

export async function lambdaStartup(): Promise<Result<AppState>> {
  return (await githubAppIsReady())
    ? successWith(await createAppStateWithAppName(getEnvVarOrThrow('APP_NAME'), consoleLogger))
    : failedWith('Github App Not Ready')
}

export function getEnvVarOrThrow(name: string, env: NodeJS.ProcessEnv = process.env): string {
  return env[name] ?? throwFunction(`${name} not found in environment`)()
}

// See comments in AppState.ts about philosophy of appState
export async function createAppStateWithAppName(
  appName: string,
  logger: EntityStoreLogger
): Promise<AppState> {
  const clock = realClock,
    config = realCicadaConfig(appName)
  return {
    config,
    clock,
    githubClient: createRealGithubClient(await config.github()),
    entityStore: setupEntityStoreBackedByRealDynamoDB(await config.tableNames(), clock, logger),
    eventBridgeBus: realEventBridgeEventBus(config.appName),
    s3: realS3(),
    webPushWrapper: realWebPushWrapper(await config.webPush())
  }
}
