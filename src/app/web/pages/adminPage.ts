import { AppState } from '../../environment/AppState.js'
import { Route } from '../../internalHttpRouter/internalHttpRoute.js'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes.js'
import { pagePath } from '../routingCommon.js'
import { createAdminPageResponse } from './views/adminPageView.js'

export const adminPageRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: pagePath('admin'),
  target: adminPage
}

export async function adminPage(_: AppState, event: CicadaAuthorizedAPIEvent) {
  return createAdminPageResponse(Object.values(event.refData.publicAccounts))
}
