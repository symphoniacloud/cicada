import { AppState } from '../environment/AppState'
import { Route } from '../internalHttpRouter/internalHttpRoute'
import { CicadaAuthorizedAPIEvent } from '../inboundInterfaces/lambdaTypes'
import { generatePageViewResultWithoutHtmx } from './views/viewResultWrappers'

// Used for testing / diagnostics
export const showHelloRoute: Route<CicadaAuthorizedAPIEvent> = {
  path: '/app/hello',
  target: showHello
}

export async function showHello(_: AppState, event: CicadaAuthorizedAPIEvent) {
  return generatePageViewResultWithoutHtmx(`<p>Hello ${event.username} / ${event.userId}</p>`)
}
