// TODO - bit of a grab bag. Tidy later?
//   See also webAuth.ts
import { GitHubUserSummary } from '../ioTypes/GitHubTypes.js'
import { APIEvent } from '../ioTypes/zodUtil.js'

export function githubUserSummaryFromEvent(event: APIEvent): GitHubUserSummary {
  return {
    userId: event.requestContext.authorizer.userId,
    userName: event.requestContext.authorizer.username
  }
}
