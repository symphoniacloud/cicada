import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes'
import { JTDSchemaType } from 'ajv/dist/jtd'
import { validatingQueryStringParser } from '../../../schema/urlPathParser'
import { failedWithResult, isFailure, Result, successWith } from '../../../util/structuredResult'
import { logger } from '../../../util/logging'
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy'
import { invalidRequestResponse } from '../../htmlResponses'

export function getRepoCoordinates(
  event: CicadaAuthorizedAPIEvent
): Result<{ ownerId: number; repoId: number }, APIGatewayProxyResult> {
  const parseResult = parser(event.queryStringParameters)
  if (isFailure(parseResult)) {
    logger.warn('Invalid request in getRepoCoordinates', { reason: parseResult.reason })
    return failedWithResult('Failed to parse', invalidRequestResponse)
  }

  // TODO - can we just define the schema with ints?
  const { ownerId, repoId } = parseResult.result
  return successWith({ ownerId: parseInt(ownerId), repoId: parseInt(repoId) })
}

export interface RepoCoordinatesQueryStringParameters {
  ownerId: string
  repoId: string
}

export const repoCoordinatesSchema: JTDSchemaType<RepoCoordinatesQueryStringParameters> = {
  properties: {
    ownerId: { type: 'string' },
    repoId: { type: 'string' }
  }
}

const parser = validatingQueryStringParser(repoCoordinatesSchema)
