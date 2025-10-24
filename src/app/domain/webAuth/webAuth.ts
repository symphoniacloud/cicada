// If token valid then username will be available here

import { CicadaAPIAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes.js'
import { logger } from '../../util/logging.js'
import { isGitHubUserId } from '../../types/GitHubTypeChecks.js'
import { GitHubUserId } from '../../types/GitHubTypes.js'

export function userIdFromEvent(event: CicadaAPIAuthorizedAPIEvent): GitHubUserId {
  const userId = event.requestContext.authorizer.userId

  if (!isGitHubUserId(userId)) {
    const message = `Invalid Github User ID on API Event: ${userId}`
    logger.error(message)
    throw new Error(message)
  }

  return userId
}

export function usernameFromEvent(event: CicadaAPIAuthorizedAPIEvent): string | undefined {
  return event.requestContext.authorizer.username
}
