import { Route } from '../../internalHttpRouter/internalHttpRoute.js'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes.js'
import { AppState } from '../../environment/AppState.js'
import { loadCalculatedAndDisplayableUserSettingsOrUseDefaults } from '../../domain/user/displayableUserSettings.js'
import { createGetUserSettingsResponse } from './views/getUserSettingsView.js'
import { fragmentPath } from '../routingCommon.js'

export const getUserSettingsFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('userSettings'),
  method: 'GET',
  target: getUserSettingsFragment
}

export async function getUserSettingsFragment(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  return createGetUserSettingsResponse(
    await loadCalculatedAndDisplayableUserSettingsOrUseDefaults(appState, event.refData),
    event.refData.memberAccount.accountId
  )
}
