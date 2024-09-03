import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { AppState } from '../../environment/AppState'
import { resetPersistedUserSettings } from '../../domain/user/persistedUserSettings'
import { getWorkflowsForUser } from '../../domain/user/userVisible'
import { calculateUserSettings } from '../../domain/user/calculatedUserSettings'
import { createGetUserSettingsResponse } from './views/getUserSettingsView'
import { toDisplayableUserSettings } from '../../domain/user/displayableUserSettings'

export const postResetUserSettingsRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: '/app/fragment/resetUserSettings',
  method: 'POST',
  target: resetUserSettings
}

export async function resetUserSettings(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const userId = event.userId
  const newPersistedSettings = await resetPersistedUserSettings(appState, userId)
  const workflows = await getWorkflowsForUser(appState, userId)
  const calculatedUserSettings = calculateUserSettings(newPersistedSettings, workflows)
  return createGetUserSettingsResponse(toDisplayableUserSettings(calculatedUserSettings, workflows))
}
