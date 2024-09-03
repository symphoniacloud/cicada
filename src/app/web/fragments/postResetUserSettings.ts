import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { AppState } from '../../environment/AppState'
import { resetPersistedUserSettings } from '../../domain/user/persistedUserSettings'
import { getWorkflowsForUser } from '../../domain/user/userVisible'
import { createGetUserSettingsResponse } from './views/getUserSettingsView'
import { toCalculatedAndDisplayableUserSettings } from '../../domain/user/displayableUserSettings'

export const postResetUserSettingsRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: '/app/fragment/resetUserSettings',
  method: 'POST',
  target: resetUserSettings
}

export async function resetUserSettings(appState: AppState, { userId }: CicadaAuthorizedAPIEvent) {
  return createGetUserSettingsResponse(
    toCalculatedAndDisplayableUserSettings(
      await resetPersistedUserSettings(appState, userId),
      await getWorkflowsForUser(appState, userId)
    )
  )
}
