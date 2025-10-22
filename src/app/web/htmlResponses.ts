import { responseWithStatusCode, withContentType } from '../inboundInterfaces/httpResponses.js'
import { APIGatewayProxyResult } from 'aws-lambda'

export function htmlOkResponse(body: string): APIGatewayProxyResult {
  return htmlResponse(200, body)
}

export const invalidRequestResponse = htmlResponse(400, `"Invalid Request"`)
export const notFoundHTMLResponse = htmlResponse(404, `"Not Found"`)
export const notAuthorizedHTMLResponse = htmlResponse(403, 'Unauthorized')
export const internalErrorHTMLResponse = htmlResponse(500, 'Internal Error')

export function htmlResponse(statusCode: number, body?: string | unknown) {
  return withContentType(responseWithStatusCode(statusCode, body), 'text/html')
}
