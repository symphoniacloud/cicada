import { WithHeadersEvent } from '../../inboundInterfaces/lambdaTypes'

export function getToken(event: WithHeadersEvent) {
  const tokenCookie = getTokenCookie(event)
  return tokenCookie ? tokenCookie.split('=')[1] : undefined
}

// Using both single and multi value headers because there may only be one cookie
// if user manually delete "isLoggedIn" cookie, otherwise more than one
function getTokenCookie(event: WithHeadersEvent) {
  const singleHeaderTokenCookie = (event.headers?.Cookie ?? '')
    .split(';')
    .map((x) => x.trim())
    .find((x) => x.startsWith('token='))

  if (singleHeaderTokenCookie) return singleHeaderTokenCookie

  return (event.multiValueHeaders?.Cookie ?? []).find((x) => x.startsWith('token='))
}
