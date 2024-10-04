import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { AppState } from '../../environment/AppState'
import { loadCalculatedAndDisplayableUserSettingsOrUseDefaults } from '../../domain/user/displayableUserSettings'
import { createGetUserSettingsResponse } from './views/getUserSettingsView'
import { fragmentPath } from '../routingCommon'
import { loadInstallationAccountStructureForUser } from '../../domain/github/githubAccountStructure'

export const getUserSettingsFragmentRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('userSettings'),
  method: 'GET',
  target: getUserSettingsFragment
}

export async function getUserSettingsFragment(appState: AppState, { userId }: CicadaAuthorizedAPIEvent) {
  return createGetUserSettingsResponse(
    await loadCalculatedAndDisplayableUserSettingsOrUseDefaults(
      appState,
      userId,
      await loadInstallationAccountStructureForUser(appState, userId)
    )
  )
}
