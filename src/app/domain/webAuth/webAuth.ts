// If token valid then username will be available here

import { CicadaAPIAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes'

export function userIdFromEvent(event: CicadaAPIAuthorizedAPIEvent): number | undefined {
  const userId = event.requestContext.authorizer.userId
  if (userId !== undefined) {
    const parsed = parseInt(userId)
    if (!isNaN(parsed)) {
      return parsed
    }
  }
  return undefined
}

export function usernameFromEvent(event: CicadaAPIAuthorizedAPIEvent): string | undefined {
  return event.requestContext.authorizer.username
}
