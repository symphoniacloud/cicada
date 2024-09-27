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
): Result<{ accountId?: string; repoId?: string }, APIGatewayProxyResult> {
  const parseResult = parser(event.queryStringParameters ?? {})
  if (isFailure(parseResult)) {
    logger.warn('Invalid request in getOptionalRepoCoordinates', { reason: parseResult.reason })
    return failedWithResult('Failed to parse', invalidRequestResponse)
  }

  const { accountId, repoId } = parseResult.result
  return successWith({
    ...(accountId ? { accountId } : {}),
    ...(repoId ? { repoId } : {})
  })
}

export type OptionalRepoCoordinatesQueryStringParameters = Partial<RepoCoordinatesQueryStringParameters>

export const optionalRepoCoordinatesSchema: JTDSchemaType<OptionalRepoCoordinatesQueryStringParameters> = {
  optionalProperties: repoCoordinatesSchema.properties
}

const parser = validatingQueryStringParser(optionalRepoCoordinatesSchema)
