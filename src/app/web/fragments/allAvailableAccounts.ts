import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { fragmentPath } from '../routingCommon'
import { createAllAvailableAccountsResponse } from './views/allAvailableAccountsView'

export const allAvailableAccountsRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('allAvailableAccounts'),
  target: allAvailableAccounts
}

export async function allAvailableAccounts(_: AppState, event: CicadaAuthorizedAPIEvent) {
  return createAllAvailableAccountsResponse(event.refData)
}
