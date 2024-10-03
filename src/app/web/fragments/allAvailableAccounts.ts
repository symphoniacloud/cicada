import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { fragmentPath } from '../routingCommon'
import { createAllAvailableAccountsResponse } from './views/allAvailableAccountsView'
import { loadInstallationAccountStructureForUser } from '../../domain/github/githubAccountStructure'

export const allAvailableAccountsRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: fragmentPath('allAvailableAccounts'),
  target: allAvailableAccounts
}

export async function allAvailableAccounts(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  return createAllAvailableAccountsResponse(
    await loadInstallationAccountStructureForUser(appState, event.userId)
  )
}
