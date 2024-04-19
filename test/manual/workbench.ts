/* eslint-disable @typescript-eslint/no-unused-vars */

import * as dotenv from 'dotenv'
import path from 'path'
import { appStateForTests } from '../remote/integrationTestSupport/cloudEnvironment'
import { callGithubToFinishAppCreation } from '../../src/app/domain/github/setup/processGithubSetupRedirect'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

async function run() {
  // const appState = await appStateForTests()
  // const result = callGithubToFinishAppCreation('0787bdfa4db1ad3e4ad2805db6c8cd95029f3ef5')
  // console.log(result)
  // await crawlGithubApp(appState, { crawlChildObjects: 'always', lookbackDays: 180 })
}

run()
