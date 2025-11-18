import { AppState } from '../../environment/AppState.js'
import { Route } from '../../internalHttpRouter/internalHttpRoute.js'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes.js'
import { pageViewResponse } from '../viewResultWrappers.js'
import { p } from '@symphoniacloud/hiccough'
import { pagePath } from '../routingCommon.js'

// Used for testing / diagnostics
export const helloPageRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: pagePath('hello'),
  target: helloPage
}

export async function helloPage(_: AppState, event: CicadaAuthorizedAPIEvent) {
  return pageViewResponse([p('Hello ', event.username, ' / ', `${event.refData.userId}`)])
}
