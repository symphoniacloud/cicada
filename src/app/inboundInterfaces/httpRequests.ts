import { isSuccess, Result, successWith } from '../util/structuredResult.js'
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

export function parsePartialAPIGatewayEventQueryStringWithSchema<TSchema extends z.ZodObject>(
  schema: TSchema,
  event: APIGatewayProxyEvent,
  failureResponse: APIGatewayProxyResult,
  loggingDetail?: string
): Result<Partial<z.infer<TSchema>>, APIGatewayProxyResult> {
  // Default querystring to {} on purpose, since we are partial parsing
  const result = safeParseWithSchema(schema.partial(), event.queryStringParameters ?? {}, failureResponse, {
    logFailures: true,
    logDetail: loggingDetail
  })
  // Safe cast: schema.partial().safeParse() returns Partial<z.infer<T>> by design
  return isSuccess(result) ? successWith(result.result as Partial<z.infer<TSchema>>) : result
}
