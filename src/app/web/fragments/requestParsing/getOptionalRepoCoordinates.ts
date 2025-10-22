import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes.js'
import {
  failedWith,
  failedWithResult,
  isFailure,
  Result,
  successWith
} from '../../../util/structuredResult.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import { logger } from '../../../util/logging.js'
import { invalidRequestResponse } from '../../htmlResponses.js'
import { validatingQueryStringParser } from '../../../schema/urlPathParser.js'
import { JTDSchemaType } from 'ajv/dist/jtd.js'
import { RepoCoordinatesQueryStringParameters, repoCoordinatesSchema } from './getRepoCoordinates.js'
import { GithubAccountId, isGithubAccountId } from '../../../domain/types/GithubAccountId.js'
import { GithubRepoId, isGithubRepoId } from '../../../domain/types/GithubRepoId.js'

export function getOptionalRepoCoordinates(
  event: CicadaAuthorizedAPIEvent
): Result<{ accountId?: GithubAccountId; repoId?: GithubRepoId }, APIGatewayProxyResult> {
  const parseResult = parser(event.queryStringParameters ?? {})
  if (isFailure(parseResult)) {
    logger.warn('Invalid request in getOptionalRepoCoordinates', { reason: parseResult.reason })
    return failedWithResult('Failed to parse', invalidRequestResponse)
  }

  const { accountId, repoId } = parseResult.result
  const accountIdCheck = checkAccountId(accountId)
  const repoIdCheck = checkRepoId(repoId)

  // TOEventually - put this into AJV parser
  if (isFailure(accountIdCheck)) {
    logger.warn('Invalid request in getOptionalRepoCoordinates', { reason: accountIdCheck.reason })
    return failedWithResult('Failed to parse', invalidRequestResponse)
  }
  if (isFailure(repoIdCheck)) {
    logger.warn('Invalid request in getOptionalRepoCoordinates', { reason: repoIdCheck.reason })
    return failedWithResult('Failed to parse', invalidRequestResponse)
  }
  return successWith({
    accountId: accountIdCheck.result,
    repoId: repoIdCheck.result
  })
}

export type OptionalRepoCoordinatesQueryStringParameters = Partial<RepoCoordinatesQueryStringParameters>

export const optionalRepoCoordinatesSchema: JTDSchemaType<OptionalRepoCoordinatesQueryStringParameters> = {
  optionalProperties: repoCoordinatesSchema.properties
}

const parser = validatingQueryStringParser(optionalRepoCoordinatesSchema)

export function checkAccountId(accountId?: string): Result<GithubAccountId | undefined> {
  if (!accountId) return successWith(undefined)
  if (isGithubAccountId(accountId)) return successWith(accountId)
  return failedWith('Invalid type of Account ID')
}

export function checkRepoId(repoId?: string): Result<GithubRepoId | undefined> {
  if (!repoId) return successWith(undefined)
  if (isGithubRepoId(repoId)) return successWith(repoId)
  return failedWith('Invalid type of Repo ID')
}
