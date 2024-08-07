import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { AppState } from '../../environment/AppState'
import { getDisplayableUserSettingsOrDefaultsForAllWorkflows } from '../../domain/user/displayableUserSettings'
import { createUserSettingsResponse } from './views/userSettingsView'

export const userSettingsRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: '/app/fragment/userSettings',
  target: userSettings
}

export async function userSettings(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const userSettings = await getDisplayableUserSettingsOrDefaultsForAllWorkflows(appState, event.userId)
  return createUserSettingsResponse(userSettings)
}
