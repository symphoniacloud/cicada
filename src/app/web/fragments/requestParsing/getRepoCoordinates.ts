import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes'
import { JTDSchemaType } from 'ajv/dist/jtd'
import { validatingQueryStringParser } from '../../../schema/urlPathParser'
import { failedWithResult, isFailure, Result, successWith } from '../../../util/structuredResult'
import { logger } from '../../../util/logging'
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy'
import { invalidRequestResponse } from '../../htmlResponses'

export function getRepoCoordinates(
  event: CicadaAuthorizedAPIEvent
): Result<{ accountId: string; repoId: string }, APIGatewayProxyResult> {
  const parseResult = parser(event.queryStringParameters)
  if (isFailure(parseResult)) {
    logger.warn('Invalid request in getRepoCoordinates', { reason: parseResult.reason })
    return failedWithResult('Failed to parse', invalidRequestResponse)
  }

  const { accountId, repoId } = parseResult.result
  return successWith({ accountId, repoId })
}

export interface RepoCoordinatesQueryStringParameters {
  accountId: string
  repoId: string
}

export const repoCoordinatesSchema: JTDSchemaType<RepoCoordinatesQueryStringParameters> = {
  properties: {
    accountId: { type: 'string' },
    repoId: { type: 'string' }
  }
}

const parser = validatingQueryStringParser(repoCoordinatesSchema)
