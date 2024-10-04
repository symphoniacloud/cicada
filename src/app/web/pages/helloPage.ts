import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { pageViewResponse } from '../viewResultWrappers'
import { p } from '../hiccough/hiccoughElements'
import { pagePath } from '../routingCommon'

// Used for testing / diagnostics
export const helloPageRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: pagePath('hello'),
  target: helloPage
}

export async function helloPage(_: AppState, event: CicadaAuthorizedAPIEvent) {
  return pageViewResponse([p('Hello ', event.username, ' / ', `${event.refData.userId}`)])
}
