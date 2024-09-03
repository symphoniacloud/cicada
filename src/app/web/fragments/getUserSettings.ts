import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { AppState } from '../../environment/AppState'
import { toCalculatedAndDisplayableUserSettings } from '../../domain/user/displayableUserSettings'
import { createGetUserSettingsResponse } from './views/getUserSettingsView'
import { getWorkflowsForUser } from '../../domain/user/userVisible'
import { getUserSettings } from '../../domain/user/persistedUserSettings'

export const getUserSettingsRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: '/app/fragment/userSettings',
  method: 'GET',
  target: getUserSettingsFragment
}

export async function getUserSettingsFragment(appState: AppState, { userId }: CicadaAuthorizedAPIEvent) {
  return createGetUserSettingsResponse(
    toCalculatedAndDisplayableUserSettings(
      await getUserSettings(appState, userId),
      await getWorkflowsForUser(appState, userId)
    )
  )
}
