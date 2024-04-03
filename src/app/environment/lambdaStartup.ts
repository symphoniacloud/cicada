import { AppState } from './AppState'
import { realClock } from '../util/dateAndTime'
import { createRealGithubClient } from '../outboundInterfaces/githubClient'
import { realWebPushWrapper } from '../outboundInterfaces/webPushWrapper'
import { realEventBridgeEventBus } from '../outboundInterfaces/eventBridgeBus'
import { setupEntityStoreBackedByRealDynamoDB } from '../domain/entityStore/initEntityStore'
import { realCicadaConfig } from './config'
import { realS3 } from '../outboundInterfaces/s3Wrapper'
import { consoleLogger, EntityStoreLogger } from '@symphoniacloud/dynamodb-entity-store'
import { throwFunction } from '../../multipleContexts/errors'

export async function lambdaStartup(): Promise<AppState> {
  return await createAppStateWithAppName(getEnvVarOrThrow('APP_NAME'), consoleLogger)
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
