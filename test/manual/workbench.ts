/* eslint-disable @typescript-eslint/no-unused-vars */

import { appStateForTests } from '../remote/integrationTestSupport/cloudEnvironment.js'
import { loadCalculatedAndDisplayableUserSettingsOrUseDefaults } from '../../src/app/domain/user/displayableUserSettings.js'
import { loadUserScopeReferenceData } from '../../src/app/domain/github/userScopeReferenceData.js'

async function run() {
  const appState = await appStateForTests()
  const result = await loadCalculatedAndDisplayableUserSettingsOrUseDefaults(
    appState,
    await loadUserScopeReferenceData(appState, 'GHUser49635')
  )
  console.log(result)
}

run()
