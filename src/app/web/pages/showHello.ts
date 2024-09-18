import { AppState } from '../../environment/AppState'
import { Route } from '../../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'
import { pageViewResultWithoutHtmx } from '../viewResultWrappers'
import { p } from '../hiccough/hiccoughElements'
import { pagePath } from '../routingCommon'

// Used for testing / diagnostics
export const showHelloPageRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: pagePath('hello'),
  target: showHello
}

export async function showHello(_: AppState, event: CicadaAuthorizedAPIEvent) {
  return pageViewResultWithoutHtmx([p('Hello ', event.username, ' / ', `${event.userId}`)])
}
