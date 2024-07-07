import { responseWithStatusCode, withContentType } from '../inboundInterfaces/httpResponses'
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy'

export function htmlOkResponse(body: string): APIGatewayProxyResult {
  return htmlResponse(200, body)
}

export const invalidRequestResponse = htmlResponse(400, `"Invalid Request"`)
export const notFoundHTMLResponse = htmlResponse(404, `"Not Found"`)
export const notAuthorizedHTMLResponse = htmlResponse(403, 'Unauthorized')

export function htmlResponse(statusCode: number, body?: string | unknown) {
  return withContentType(responseWithStatusCode(statusCode, body), 'text/html')
}
