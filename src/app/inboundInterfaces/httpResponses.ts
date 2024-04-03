import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy'
import { logger } from '../util/logging'

export function responseWithStatusCode(statusCode: number, body?: string | unknown): APIGatewayProxyResult {
  return {
    statusCode,
    body: stringifyIfNecessary(body ?? '')
  }
}

export function okResult(body?: string | unknown): APIGatewayProxyResult {
  return responseWithStatusCode(200, body)
}

export function htmlOkResult(body: string): APIGatewayProxyResult {
  return withHtmlContentType(okResult(body))
}

export function jsonOkResult(body: unknown): APIGatewayProxyResult {
  return withJSONContentType(okResult(body))
}

export function foundRedirectResponse(location: string): APIGatewayProxyResult {
  return redirectResponse(302, location)
}

export function redirectResponse(statusCode: number, location: string): APIGatewayProxyResult {
  return withHeader(responseWithStatusCode(statusCode, ''), 'Location', location)
}

// Internal error but likely due to something between client request and Lambda function, so don't throw error
export function applicationJSONErrorAndLog(internalMessage: string): APIGatewayProxyResult {
  logger.error(internalMessage)
  return withJSONContentType(responseWithStatusCode(500, `"Application internal error"`))
}

export function withHtmlContentType(result: APIGatewayProxyResult): APIGatewayProxyResult {
  return withContentType(result, 'text/html')
}

export function withJSONContentType(result: APIGatewayProxyResult): APIGatewayProxyResult {
  return withContentType(result, 'application/json')
}

export function withContentType(result: APIGatewayProxyResult, contentType: string): APIGatewayProxyResult {
  return withHeader(result, 'Content-Type', contentType)
}

export function redirectResponseWithCookies(location: string, cookies: string[]) {
  return {
    ...responseWithStatusCode(302, ''),
    multiValueHeaders: {
      Location: [location],
      'Set-Cookie': cookies
    }
  }
}

export function withHeader(
  result: APIGatewayProxyResult,
  name: string,
  value: string
): APIGatewayProxyResult {
  const newHeaderPart: Record<string, string> = {}
  newHeaderPart[name] = value

  return {
    ...result,
    headers: {
      ...(result.headers ?? {}),
      ...newHeaderPart
    }
  }
}

function stringifyIfNecessary(body: string | unknown) {
  return typeof body === 'string' ? body : JSON.stringify(body)
}
