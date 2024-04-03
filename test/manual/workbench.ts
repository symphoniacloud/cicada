/* eslint-disable @typescript-eslint/no-unused-vars */

import * as dotenv from 'dotenv'
import path from 'path'
import { appStateForTests } from '../remote/integrationTestSupport/cloudEnvironment'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

async function run() {
  const appState = await appStateForTests()
  // await crawlGithubApp(appState, { crawlChildObjects: 'always', lookbackDays: 180 })
}

run()
