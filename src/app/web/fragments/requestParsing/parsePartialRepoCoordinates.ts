import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes.js'
import { failedWithResult, Result, successWith } from '../../../util/structuredResult.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import { logger } from '../../../util/logging.js'
import { invalidRequestResponse } from '../../htmlResponses.js'
import { GitHubRepoCoordinates, GitHubRepoCoordinatesSchema } from '../../../types/GitHubCoordinateTypes.js'

export function parsePartialRepoCoordinates(
  event: CicadaAuthorizedAPIEvent
): Result<Partial<GitHubRepoCoordinates>, APIGatewayProxyResult> {
  const result = GitHubRepoCoordinatesSchema.partial().safeParse(event.queryStringParameters ?? {})
  if (result.success) {
    return successWith(result.data)
  }

  logger.warn('Invalid request in parsePartialRepoCoordinates')
  return failedWithResult('Invalid request', invalidRequestResponse)
}
