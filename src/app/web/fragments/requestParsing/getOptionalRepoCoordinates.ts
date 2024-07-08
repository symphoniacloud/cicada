import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes'
import { failedWithResult, isFailure, Result, successWith } from '../../../util/structuredResult'
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy'
import { logger } from '../../../util/logging'
import { invalidRequestResponse } from '../../htmlResponses'
import { validatingQueryStringParser } from '../../../schema/urlPathParser'
import { JTDSchemaType } from 'ajv/dist/jtd'
import { RepoCoordinatesQueryStringParameters, repoCoordinatesSchema } from './getRepoCoordinates'

export function getOptionalRepoCoordinates(
  event: CicadaAuthorizedAPIEvent
): Result<{ ownerId?: number; repoId?: number }, APIGatewayProxyResult> {
  const parseResult = parser(event.queryStringParameters ?? {})
  if (isFailure(parseResult)) {
    logger.warn('Invalid request in getOptionalRepoCoordinates', { reason: parseResult.reason })
    return failedWithResult('Failed to parse', invalidRequestResponse)
  }

  // TODO - can we just define the schema with ints?
  const { ownerId, repoId } = parseResult.result
  return successWith({
    ...(ownerId ? { ownerId: parseInt(ownerId) } : {}),
    ...(repoId ? { repoId: parseInt(repoId) } : {})
  })
}

export type OptionalRepoCoordinatesQueryStringParameters = Partial<RepoCoordinatesQueryStringParameters>

export const optionalRepoCoordinatesSchema: JTDSchemaType<OptionalRepoCoordinatesQueryStringParameters> = {
  optionalProperties: repoCoordinatesSchema.properties
}

const parser = validatingQueryStringParser(optionalRepoCoordinatesSchema)
