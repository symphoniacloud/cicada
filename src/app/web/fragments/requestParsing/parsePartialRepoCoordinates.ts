import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes.js'
import { failedWithResult, Result, successWith } from '../../../util/structuredResult.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import { logger } from '../../../util/logging.js'
import { invalidRequestResponse } from '../../htmlResponses.js'
import {
  isPartialGitHubRepoCoordinates,
  PartialGitHubRepoCoordinates
} from '../../../types/GitHubCoordinateTypes.js'
import { pickOptionalProperties } from '../../../util/collections.js'

export function parsePartialRepoCoordinates(
  event: CicadaAuthorizedAPIEvent
): Result<PartialGitHubRepoCoordinates, APIGatewayProxyResult> {
  const params = event.queryStringParameters ?? {}
  if (isPartialGitHubRepoCoordinates(params)) {
    return successWith(
      pickOptionalProperties(params, ['accountId', 'repoId']) as PartialGitHubRepoCoordinates
    )
  }

  logger.warn('Invalid request in parsePartialRepoCoordinates')
  return failedWithResult('Invalid request', invalidRequestResponse)
}
