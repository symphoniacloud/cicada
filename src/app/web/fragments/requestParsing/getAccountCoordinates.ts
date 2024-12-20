import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes'
import { JTDSchemaType } from 'ajv/dist/jtd'
import { validatingQueryStringParser } from '../../../schema/urlPathParser'
import { failedWithResult, isFailure, Result, successWith } from '../../../util/structuredResult'
import { logger } from '../../../util/logging'
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy'
import { invalidRequestResponse } from '../../htmlResponses'
import { GithubAccountId, isGithubAccountId } from '../../../domain/types/GithubAccountId'

export function getAccountCoordinates(
  event: CicadaAuthorizedAPIEvent
): Result<{ accountId: GithubAccountId }, APIGatewayProxyResult> {
  const parseResult = parser(event.queryStringParameters)
  if (isFailure(parseResult)) {
    logger.warn('Invalid request in getAccountCoordinates', { reason: parseResult.reason })
    return failedWithResult('Failed to parse', invalidRequestResponse)
  }

  const { accountId } = parseResult.result
  // TOEventually - put this into AJV parser
  if (!isGithubAccountId(accountId)) {
    logger.warn('Invalid request in getAccountCoordinates', { reason: 'Invalid type of Account ID' })
    return failedWithResult('Invalid type of Account ID', invalidRequestResponse)
  }

  return successWith({ accountId })
}

export interface AccountCoordinatesQueryStringParameters {
  accountId: string
}

export const accountCoordinatesSchema: JTDSchemaType<AccountCoordinatesQueryStringParameters> = {
  properties: {
    accountId: { type: 'string' }
  }
}

const parser = validatingQueryStringParser(accountCoordinatesSchema)
