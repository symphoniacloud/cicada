import { responseWithStatusCode, withJSONContentType } from './httpResponses.js'
import { z } from 'zod'
import { CicadaAPIAuthorizedAPIEvent } from './lambdaTypes.js'
import { Result } from '../util/structuredResult.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import { parseAPIGatewayEventWithSchema } from './httpRequests.js'

const JSONInvalidRequestResponse = withJSONContentType(
  responseWithStatusCode(400, { message: 'Invalid request' })
)

// This is for JSON for now
export function parseJSONAPIEventWithSchema<TSchema extends z.ZodType>(
  event: CicadaAPIAuthorizedAPIEvent,
  schema: TSchema
): Result<z.infer<TSchema>, APIGatewayProxyResult> {
  return parseAPIGatewayEventWithSchema(schema, event, JSONInvalidRequestResponse)
}
