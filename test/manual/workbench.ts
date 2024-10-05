/* eslint-disable @typescript-eslint/no-unused-vars */

import { appStateForTests } from '../remote/integrationTestSupport/cloudEnvironment'
import { loadCalculatedAndDisplayableUserSettingsOrUseDefaults } from '../../src/app/domain/user/displayableUserSettings'
import { loadUserScopeReferenceData } from '../../src/app/domain/github/userScopeReferenceData'

async function run() {
  const appState = await appStateForTests()
  const result = await loadCalculatedAndDisplayableUserSettingsOrUseDefaults(
    appState,
    await loadUserScopeReferenceData(appState, 'GHUser49635')
  )
  console.log(result)
}

run()
