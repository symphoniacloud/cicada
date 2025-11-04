import { Result } from '../util/structuredResult.js'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { z } from 'zod'
import { safeParseWithSchema } from '../ioTypes/zodUtil.js'

export function parseAPIGatewayEventWithSchema<TSchema extends z.ZodType>(
  schema: TSchema,
  event: APIGatewayProxyEvent,
  failureResponse: APIGatewayProxyResult
): Result<z.infer<TSchema>, APIGatewayProxyResult> {
  return safeParseWithSchema(schema, event, failureResponse, { logFailures: true })
}

export function parseAPIGatewayEventQueryStringWithSchema<TSchema extends z.ZodType>(
  schema: TSchema,
  event: APIGatewayProxyEvent,
  failureResponse: APIGatewayProxyResult,
  loggingDetail?: string
): Result<z.infer<TSchema>, APIGatewayProxyResult> {
  return safeParseWithSchema(schema, event.queryStringParameters, failureResponse, {
    logFailures: true,
    logDetail: loggingDetail
  })
}
