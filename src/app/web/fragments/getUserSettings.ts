import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { AppState } from '../../environment/AppState'
import { loadCalculatedAndDisplayableUserSettingsOrUseDefaults } from '../../domain/user/displayableUserSettings'
import { createGetUserSettingsResponse } from './views/getUserSettingsView'
import { fragmentPath } from '../routingCommon'

export const getUserSettingsFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('userSettings'),
  method: 'GET',
  target: getUserSettingsFragment
}

export async function getUserSettingsFragment(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  return createGetUserSettingsResponse(
    await loadCalculatedAndDisplayableUserSettingsOrUseDefaults(appState, event.refData)
  )
}
