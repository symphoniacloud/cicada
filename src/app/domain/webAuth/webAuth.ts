// If token valid then username will be available here

import { CicadaAPIAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes.js'
import { logger } from '../../util/logging.js'
import { GithubUserId, isGithubUserId } from '../types/GithubUserId.js'

export function userIdFromEvent(event: CicadaAPIAuthorizedAPIEvent): GithubUserId {
  const userId = event.requestContext.authorizer.userId

  if (!isGithubUserId(userId)) {
    const message = `Invalid Github User ID on API Event: ${userId}`
    logger.error(message)
    throw new Error(message)
  }

  return userId
}

export function usernameFromEvent(event: CicadaAPIAuthorizedAPIEvent): string | undefined {
  return event.requestContext.authorizer.username
}
