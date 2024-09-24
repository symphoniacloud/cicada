import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes'
import { JTDSchemaType } from 'ajv/dist/jtd'
import { validatingQueryStringParser } from '../../../schema/urlPathParser'
import { failedWithResult, isFailure, Result, successWith } from '../../../util/structuredResult'
import { logger } from '../../../util/logging'
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy'
import { invalidRequestResponse } from '../../htmlResponses'

export function getAccountCoordinates(
  event: CicadaAuthorizedAPIEvent
): Result<{ ownerId: number }, APIGatewayProxyResult> {
  const parseResult = parser(event.queryStringParameters)
  if (isFailure(parseResult)) {
    logger.warn('Invalid request in getAccountCoordinates', { reason: parseResult.reason })
    return failedWithResult('Failed to parse', invalidRequestResponse)
  }

  // TODO - can we just define the schema with ints?
  const { ownerId } = parseResult.result
  return successWith({ ownerId: parseInt(ownerId) })
}

export interface AccountCoordinatesQueryStringParameters {
  ownerId: string
}

export const accountCoordinatesSchema: JTDSchemaType<AccountCoordinatesQueryStringParameters> = {
  properties: {
    ownerId: { type: 'string' }
  }
}

const parser = validatingQueryStringParser(accountCoordinatesSchema)
