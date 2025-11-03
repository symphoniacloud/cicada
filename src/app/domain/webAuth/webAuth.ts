import { CicadaAPIAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes.js'
import { GitHubUserId } from '../../ioTypes/GitHubTypes.js'
import { GitHubUserIdSchema } from '../../ioTypes/GitHubSchemas.js'

export function userIdFromEvent(event: CicadaAPIAuthorizedAPIEvent): GitHubUserId {
  return GitHubUserIdSchema.parse(event.requestContext.authorizer.userId)
}

export function usernameFromEvent(event: CicadaAPIAuthorizedAPIEvent): string | undefined {
  return event.requestContext.authorizer.username
}
