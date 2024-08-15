import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { AppState } from '../../environment/AppState'
import { toDisplayableUserSettings } from '../../domain/user/displayableUserSettings'
import { createGetUserSettingsResponse } from './views/getUserSettingsView'
import { getWorkflowsForUser } from '../../domain/user/userVisible'
import { calculateUserSettings } from '../../domain/user/calculatedUserSettings'
import { getUserSettings } from '../../domain/user/persistedUserSettings'

export const getUserSettingsRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: '/app/fragment/userSettings',
  method: 'GET',
  target: getUserSettingsFragment
}

export async function getUserSettingsFragment(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const userId = event.userId
  const workflows = await getWorkflowsForUser(appState, userId)
  const persistedUserSettings = await getUserSettings(appState, userId)

  console.log('persisted')
  console.log(JSON.stringify(persistedUserSettings.github.accounts.get(23423383)?.repos.get(232433818)))
  const calculatedUserSettings = calculateUserSettings(persistedUserSettings, workflows)
  console.log('calculated')
  console.log(JSON.stringify(calculatedUserSettings.github.accounts.get(23423383)?.repos.get(232433818)))

  return createGetUserSettingsResponse(toDisplayableUserSettings(calculatedUserSettings, workflows))
}
