import { MinimalAPIGatewayProxyEvent, Route } from './internalHttpRoute'
import UrlPattern from 'url-pattern'

export type Matcher<TEvent> = (event: TEvent) => boolean

export function matcherForRoute<TEvent extends MinimalAPIGatewayProxyEvent, TAppState>(
  route: Route<TEvent, TAppState>
) {
  return {
    match: route.method ? methodAndPathMatcher(route.method, route.path) : pathMatcher(route.path),
    route: route
  }
}

function pathMatcher<TEvent extends MinimalAPIGatewayProxyEvent>(path: string): Matcher<TEvent> {
  const pathPattern = new UrlPattern(path)

  return (event: TEvent) => {
    return pathPattern.match(event.path)
  }
}

function methodAndPathMatcher<TEvent extends MinimalAPIGatewayProxyEvent>(
  method: string,
  path: string
): Matcher<TEvent> {
  const pathMatch = pathMatcher(path)
  const matcherMethod = method.toUpperCase()

  return (event: TEvent) => {
    return pathMatch(event) && event.httpMethod.toUpperCase() === matcherMethod
  }
}
