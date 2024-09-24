import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { pagePath } from '../routingCommon'
import { createAdminPageResponse } from './views/adminPageView'
import { getPublicAccountsForUser } from '../../domain/github/githubPublicAccount'

export const adminPageRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: pagePath('admin'),
  target: adminPage
}

export async function adminPage(appState: AppState, event: CicadaAuthorizedAPIEvent) {
  const publicAccounts = await getPublicAccountsForUser(appState, event.userId)
  return createAdminPageResponse(publicAccounts)
}
