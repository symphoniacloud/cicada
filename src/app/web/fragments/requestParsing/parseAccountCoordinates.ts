import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes.js'
import { failedWithResult, Result, successWith } from '../../../util/structuredResult.js'
import { logger } from '../../../util/logging.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import { invalidRequestResponse } from '../../htmlResponses.js'
import { GitHubAccountCoordinates, isGitHubAccountCoordinates } from '../../../types/GitHubCoordinateTypes.js'
import { pickProperties } from '../../../util/collections.js'

export function parseAccountCoordinates(
  event: CicadaAuthorizedAPIEvent
): Result<GitHubAccountCoordinates, APIGatewayProxyResult> {
  if (isGitHubAccountCoordinates(event.queryStringParameters))
    return successWith(pickProperties(event.queryStringParameters, ['accountId']))
  logger.warn('Invalid request in getAccountCoordinates')
  return failedWithResult('Invalid request - no account ID', invalidRequestResponse)
}
