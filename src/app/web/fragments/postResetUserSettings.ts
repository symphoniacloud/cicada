import { Route } from '../../internalHttpRouter/internalHttpRoute.js'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes.js'
import { AppState } from '../../environment/AppState.js'
import { resetPersistedUserSettings } from '../../domain/user/persistedUserSettings.js'
import { createGetUserSettingsResponse } from './views/getUserSettingsView.js'
import { toCalculatedAndDisplayableUserSettings } from '../../domain/user/displayableUserSettings.js'
import { fragmentPath } from '../routingCommon.js'

export const postResetUserSettingsFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('resetUserSettings'),
  method: 'POST',
  target: resetUserSettings
}

export async function resetUserSettings(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  return createGetUserSettingsResponse(
    toCalculatedAndDisplayableUserSettings(
      await resetPersistedUserSettings(appState, event.refData.userId),
      event.refData
    ),
    event.refData.memberAccount.accountId
  )
}
