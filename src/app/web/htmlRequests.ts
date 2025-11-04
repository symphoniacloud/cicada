// This is for HTML for now
import { z } from 'zod'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { Result } from '../util/structuredResult.js'
import { invalidRequestResponse } from './htmlResponses.js'
import {
  parseAPIGatewayEventQueryStringWithSchema,
  parsePartialAPIGatewayEventQueryStringWithSchema
} from '../inboundInterfaces/httpRequests.js'
import { CicadaAuthorizedAPIEvent } from '../inboundInterfaces/lambdaTypes.js'

export function parseQueryStringWithSchema<T extends z.ZodType>(
  schema: T,
  event: APIGatewayProxyEvent,
  loggingDetail?: string
): Result<z.infer<T>, APIGatewayProxyResult> {
  return parseAPIGatewayEventQueryStringWithSchema(schema, event, invalidRequestResponse, loggingDetail)
}

export function parsePartialQueryStringWithSchema<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  event: CicadaAuthorizedAPIEvent,
  errorContext: string
): Result<Partial<z.infer<T>>, APIGatewayProxyResult> {
  return parsePartialAPIGatewayEventQueryStringWithSchema(schema, event, invalidRequestResponse, errorContext)
}
