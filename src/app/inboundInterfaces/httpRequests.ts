import { z } from 'zod'
import { CicadaAPIAuthorizedAPIEvent } from './lambdaTypes.js'
import { failedWithResult, Result, successWith } from '../util/structuredResult.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import { logger } from '../util/logging.js'
import { responseWithStatusCode, withJSONContentType } from './httpResponses.js'

export function parseAPIEventWithSchema<TSchema extends z.ZodType>(
  event: CicadaAPIAuthorizedAPIEvent,
  schema: TSchema
): Result<z.infer<TSchema>, APIGatewayProxyResult> {
  const parseResult = schema.safeParse(event)
  if (!parseResult.success) {
    logger.warn('Request parsing failed', { parseResult })
    return failedWithResult(
      'Parse failure',
      withJSONContentType(responseWithStatusCode(400, { message: 'Invalid request' }))
    )
  }
  return successWith(parseResult.data)
}
