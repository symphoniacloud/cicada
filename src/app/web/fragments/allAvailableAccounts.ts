import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { fragmentPath } from '../routingCommon'
import { createAllAvailableAccountsResponse } from './views/allAvailableAccountsView'
import { getAllAccountsForUser } from '../../domain/github/githubAccount'

export const allAvailableAccountsRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('allAvailableAccounts'),
  target: allAvailableAccounts
}

export async function allAvailableAccounts(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const { memberAccounts, publicAccounts } = await getAllAccountsForUser(appState, event.userId)
  return createAllAvailableAccountsResponse(memberAccounts, publicAccounts)
}
