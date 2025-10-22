import { userInfo } from 'node:os'
import { createAppStateWithAppName } from '../../../src/app/environment/lambdaStartup.js'
import { AppState } from '../../../src/app/environment/AppState.js'
import { SsmParamName } from '../../../src/multipleContexts/ssmParams.js'
import { noopLogger } from '@symphoniacloud/dynamodb-entity-store'
import { readFromSSMInTests } from './ssm.js'

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
