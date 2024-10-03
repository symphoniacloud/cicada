import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { AppState } from '../../environment/AppState'
import { resetPersistedUserSettings } from '../../domain/user/persistedUserSettings'
import { createGetUserSettingsResponse } from './views/getUserSettingsView'
import { toCalculatedAndDisplayableUserSettings } from '../../domain/user/displayableUserSettings'
import { fragmentPath } from '../routingCommon'
import { loadInstallationAccountStructureForUser } from '../../domain/github/githubAccountStructure'

export const postResetUserSettingsFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('resetUserSettings'),
  method: 'POST',
  target: resetUserSettings
}

export async function resetUserSettings(appState: AppState, { userId }: CicadaAuthorizedAPIEvent) {
  return createGetUserSettingsResponse(
    toCalculatedAndDisplayableUserSettings(
      await resetPersistedUserSettings(appState, userId),
      await loadInstallationAccountStructureForUser(appState, userId)
    )
  )
}
