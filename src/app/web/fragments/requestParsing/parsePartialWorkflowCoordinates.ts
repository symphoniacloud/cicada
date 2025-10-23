import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes.js'
import { failedWithResult, Result, successWith } from '../../../util/structuredResult.js'
import { logger } from '../../../util/logging.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import { invalidRequestResponse } from '../../htmlResponses.js'
import { GitHubWorkflowKey, GitHubWorkflowKeySchema } from '../../../types/GitHubKeyTypes.js'

export function parsePartialWorkflowCoordinates(
  event: CicadaAuthorizedAPIEvent
): Result<Partial<GitHubWorkflowKey>, APIGatewayProxyResult> {
  const result = GitHubWorkflowKeySchema.partial().safeParse(event.queryStringParameters ?? {})
  if (result.success) {
    return successWith(result.data)
  }

  logger.warn('Invalid request in parsePartialWorkflowCoordinates')
  return failedWithResult('Invalid request', invalidRequestResponse)
}
