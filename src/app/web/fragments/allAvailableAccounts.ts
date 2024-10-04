import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { fragmentPath } from '../routingCommon'
import { createAllAvailableAccountsResponse } from './views/allAvailableAccountsView'

import { loadUserScopeReferenceData } from '../../domain/github/userScopeReferenceData'

export const allAvailableAccountsRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('allAvailableAccounts'),
  target: allAvailableAccounts
}

export async function allAvailableAccounts(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  // TODO - consider putting this on event / appState
  const refData = await loadUserScopeReferenceData(appState, event.userId)
  return createAllAvailableAccountsResponse(refData)
}
