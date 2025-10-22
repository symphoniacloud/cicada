import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes.js'
import { JTDSchemaType } from 'ajv/dist/jtd.js'
import { validatingQueryStringParser } from '../../../schema/urlPathParser.js'
import { failedWithResult, isFailure, Result, successWith } from '../../../util/structuredResult.js'
import { logger } from '../../../util/logging.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import { invalidRequestResponse } from '../../htmlResponses.js'
import { GithubAccountId, isGithubAccountId } from '../../../domain/types/GithubAccountId.js'
import { GithubRepoId, isGithubRepoId } from '../../../domain/types/GithubRepoId.js'

export function getRepoCoordinates(
  event: CicadaAuthorizedAPIEvent
): Result<{ accountId: GithubAccountId; repoId: GithubRepoId }, APIGatewayProxyResult> {
  const parseResult = parser(event.queryStringParameters)
  if (isFailure(parseResult)) {
    logger.warn('Invalid request in getRepoCoordinates', { reason: parseResult.reason })
    return failedWithResult('Failed to parse', invalidRequestResponse)
  }

  const { accountId, repoId } = parseResult.result
  // TOEventually - put this into AJV parser
  if (!isGithubAccountId(accountId)) {
    logger.warn('Invalid request in getRepoCoordinates', { reason: 'Invalid type of Account ID' })
    return failedWithResult('Invalid type of Account ID', invalidRequestResponse)
  }
  if (!isGithubRepoId(repoId)) {
    logger.warn('Invalid request in getRepoCoordinates', { reason: 'Invalid type of Repo ID' })
    return failedWithResult('Invalid type of Account ID', invalidRequestResponse)
  }

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
