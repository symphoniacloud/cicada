import { logger } from '../util/logging'
import { CicadaHandler, MinimalAPIGatewayProxyEvent, Route } from './internalHttpRoute'
import { matcherForRoute } from './internalHttpMatcher'
import { notFoundHTMLResponse } from '../inboundInterfaces/standardHttpResponses'

// Cicada doesn't have a separate Lambda function for all API routes, instead we use a mixture of API Gateway
// routing and in-process routing. There's no standard way to perform in process routing - short of importing Express, and
// I didn't want to do that - so for now I have this code to provide an internal router.
// For more on this philosophy, see https://blog.symphonia.io/posts/2022-07-20_lambda_event_routing
export function createRouter<TEvent extends MinimalAPIGatewayProxyEvent, TAppState>(
  routes: Route<TEvent, TAppState>[]
) {
  const routeMatchers = routes.map(matcherForRoute)

  return (event: TEvent): CicadaHandler<TEvent, TAppState> => {
    const matchedRoute = routeMatchers.find((route) => route.match(event))
    if (matchedRoute) {
      logger.info(`Matched route ${matchedRoute.route.path}`)
      return matchedRoute.route.target
    }
    logger.warn(`Failed to find route`)
    return notFoundRoute
  }
}

// TOEventually - allow this to be overridden, e.g. for JSON requests
const notFoundRoute: CicadaHandler<MinimalAPIGatewayProxyEvent, unknown> = async () => notFoundHTMLResponse
