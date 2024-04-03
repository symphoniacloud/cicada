import { userInfo } from 'node:os'
import * as dotenv from 'dotenv'
import path from 'path'
import { createAppStateWithAppName } from '../../../src/app/environment/lambdaStartup'
import { AppState } from '../../../src/app/environment/AppState'
import { SsmParamName } from '../../../src/multipleContexts/ssmParams'
import { noopLogger } from '@symphoniacloud/dynamodb-entity-store'
import { readFromSSMInTests } from './ssm'

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

let appState: AppState

export async function appStateForTests() {
  if (!appState) {
    console.log(`Initializing AppState for app name ${getAppName()}`)
    appState = await createAppStateWithAppName(appName, noopLogger)
  }
  return appState
}

let appName: string

export function getAppName(env = process.env) {
  if (!appName) {
    appName = env['APP_NAME'] ?? `cicada-${userInfo().username}`
  }
  return appName
}

export async function lookupSSMParam(paramName: SsmParamName) {
  return await readFromSSMInTests(getAppName(), paramName)
}
