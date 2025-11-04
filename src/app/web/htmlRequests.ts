// This is for HTML for now
import { z } from 'zod'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { Result } from '../util/structuredResult.js'
import { invalidRequestResponse } from './htmlResponses.js'
import { parseAPIGatewayEventQueryStringWithSchema } from '../inboundInterfaces/httpRequests.js'

export function parseQueryStringWithSchema<T extends z.ZodTypeAny>(
  schema: T,
  event: APIGatewayProxyEvent,
  loggingDetail?: string
): Result<z.infer<T>, APIGatewayProxyResult> {
  return parseAPIGatewayEventQueryStringWithSchema(schema, event, invalidRequestResponse, loggingDetail)
}
