/* eslint-disable @typescript-eslint/no-unused-vars */

import { appStateForTests } from '../remote/integrationTestSupport/cloudEnvironment'

async function run() {
  const appState = await appStateForTests()
  const githubClient = appState.githubClient.clientForInstallation(50081716)
  const result = await githubClient.getUser('mikebroberts')
  console.log(result)
  // await crawlGithubApp(appState, { crawlChildObjects: 'always', lookbackDays: 180 })
}

run()
