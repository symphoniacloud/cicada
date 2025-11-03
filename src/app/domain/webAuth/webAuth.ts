import { CicadaAPIAuthorizedAPIEvent } from '../../inboundInterfaces/lambdaTypes.js'
import { GitHubUserId, GitHubUserSummary } from '../../ioTypes/GitHubTypes.js'
import { GitHubUserIdSchema } from '../../ioTypes/GitHubSchemas.js'
import { APIEvent } from '../../ioTypes/zodUtil.js'

export function userIdFromEvent(event: CicadaAPIAuthorizedAPIEvent): GitHubUserId {
  return GitHubUserIdSchema.parse(event.requestContext.authorizer.userId)
}

export function usernameFromEvent(event: CicadaAPIAuthorizedAPIEvent): string | undefined {
  return event.requestContext.authorizer.username
}

export function userIdFromApiEvent(event: APIEvent): GitHubUserId {
  return event.requestContext.authorizer.userId
}

export function githubUserSummaryFromEvent(event: APIEvent): GitHubUserSummary {
  return {
    userId: userIdFromApiEvent(event),
    userName: event.requestContext.authorizer.username
  }
}
