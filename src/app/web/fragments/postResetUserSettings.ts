import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { AppState } from '../../environment/AppState'
import { resetPersistedUserSettings } from '../../domain/user/persistedUserSettings'
import { getReposForUser, getWorkflowsForUser } from '../../domain/user/userVisible'
import { createGetUserSettingsResponse } from './views/getUserSettingsView'
import { toCalculatedAndDisplayableUserSettings } from '../../domain/user/displayableUserSettings'
import { fragmentPath } from '../routingCommon'

export const postResetUserSettingsFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('resetUserSettings'),
  method: 'POST',
  target: resetUserSettings
}

export async function resetUserSettings(appState: AppState, { userId }: CicadaAuthorizedAPIEvent) {
  return createGetUserSettingsResponse(
    toCalculatedAndDisplayableUserSettings(
      await resetPersistedUserSettings(appState, userId),
      await getReposForUser(appState, userId),
      await getWorkflowsForUser(appState, userId)
    )
  )
}
