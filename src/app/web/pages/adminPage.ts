import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { pagePath } from '../routingCommon'
import { createAdminPageResponse } from './views/adminPageView'

export const adminPageRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: pagePath('admin'),
  target: adminPage
}

export async function adminPage(_: AppState, event: CicadaAuthorizedAPIEvent) {
  return createAdminPageResponse(Object.values(event.refData.publicAccounts))
}
