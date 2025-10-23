import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes.js'
import { failedWithResult, Result, successWith } from '../../../util/structuredResult.js'
import { logger } from '../../../util/logging.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import { invalidRequestResponse } from '../../htmlResponses.js'
import { GitHubAccountKeySchema, GitHubAccountKey } from '../../../types/GitHubKeyTypes.js'

export function parseAccountCoordinates(
  event: CicadaAuthorizedAPIEvent
): Result<GitHubAccountKey, APIGatewayProxyResult> {
  const result = GitHubAccountKeySchema.safeParse(event.queryStringParameters)
  if (result.success) {
    return successWith(result.data)
  }

  logger.warn('Invalid request in getAccountCoordinates')
  return failedWithResult('Invalid request - no account ID', invalidRequestResponse)
}
