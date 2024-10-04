import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { AppState } from '../../environment/AppState'
import { loadCalculatedAndDisplayableUserSettingsOrUseDefaults } from '../../domain/user/displayableUserSettings'
import { createGetUserSettingsResponse } from './views/getUserSettingsView'
import { fragmentPath } from '../routingCommon'

import { loadUserScopeReferenceData } from '../../domain/github/userScopeReferenceData'

export const getUserSettingsFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('userSettings'),
  method: 'GET',
  target: getUserSettingsFragment
}

export async function getUserSettingsFragment(appState: AppState, { userId }: CicadaAuthorizedAPIEvent) {
  // TODO - consider putting this on event / appState
  const refData = await loadUserScopeReferenceData(appState, userId)

  return createGetUserSettingsResponse(
    await loadCalculatedAndDisplayableUserSettingsOrUseDefaults(appState, refData)
  )
}
