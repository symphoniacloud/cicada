import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes.js'
import { failedWithResult, Result, successWith } from '../../../util/structuredResult.js'
import { logger } from '../../../util/logging.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import { invalidRequestResponse } from '../../htmlResponses.js'
import { GithubAccountId } from '../../../domain/types/GithubAccountId.js'
import { isGitHubAccountCoordinates } from '../../../types/GitHubCoordinateTypes.js'

export function parseAccountCoordinates(
  event: CicadaAuthorizedAPIEvent
): Result<{ accountId: GithubAccountId }, APIGatewayProxyResult> {
  if (isGitHubAccountCoordinates(event.queryStringParameters))
    return successWith({ accountId: event.queryStringParameters.accountId })
  logger.warn('Invalid request in getAccountCoordinates')
  return failedWithResult('Invalid request - no account ID', invalidRequestResponse)
}
