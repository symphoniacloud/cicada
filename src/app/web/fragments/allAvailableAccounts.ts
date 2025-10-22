import { AppState } from '../../environment/AppState.js'
import { Route } from '../../internalHttpRouter/internalHttpRoute.js'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes.js'
import { fragmentPath } from '../routingCommon.js'
import { createAllAvailableAccountsResponse } from './views/allAvailableAccountsView.js'

export const allAvailableAccountsRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('allAvailableAccounts'),
  target: allAvailableAccounts
}

export async function allAvailableAccounts(_: AppState, event: CicadaAuthorizedAPIEvent) {
  return createAllAvailableAccountsResponse(event.refData)
}
