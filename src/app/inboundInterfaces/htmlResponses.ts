import { responseWithStatusCode, withHtmlContentType } from './httpResponses'

export const invalidRequestResponse = htmlResponse(400, `"Invalid Request"`)
export const notFoundHTMLResponse = htmlResponse(404, `"Not Found"`)
export const notAuthorizedHTMLResponse = htmlResponse(403, 'Unauthorized')

export function htmlResponse(statusCode: number, body?: string | unknown) {
  return withHtmlContentType(responseWithStatusCode(statusCode, body))
}
