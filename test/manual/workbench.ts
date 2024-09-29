/* eslint-disable @typescript-eslint/no-unused-vars */

import { appStateForTests } from '../remote/integrationTestSupport/cloudEnvironment'

import { fromRawGithubInstallationId } from '../../src/app/domain/types/GithubInstallationId'

async function run() {
  const appState = await appStateForTests()
  const githubClient = appState.githubClient.clientForInstallation(fromRawGithubInstallationId(50081716))
  const result = await githubClient.getUser('mikebroberts')
  console.log(result)
  // await crawlGithubApp(appState, { crawlChildObjects: 'always', lookbackDays: 180 })
}

run()

type ZooUser = `GU-${number}`
