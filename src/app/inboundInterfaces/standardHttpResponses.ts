import { applicationJSONErrorAndLog, responseWithStatusCode, withHtmlContentType } from './httpResponses'

export const notFoundHTMLResponse = withHtmlContentType(responseWithStatusCode(404, `"Not Found"`))
export const notAuthorizedHTMLResponse = withHtmlContentType(responseWithStatusCode(403, 'Unauthorized'))

// Function not constant because this logs
export function usernameFieldMissingFromContextResponse() {
  return applicationJSONErrorAndLog('username field missing from Lambda event')
}

// Function not constant because this logs
export function userIdFieldMissingFromContextResponse() {
  return applicationJSONErrorAndLog('userId field missing from Lambda event')
}
