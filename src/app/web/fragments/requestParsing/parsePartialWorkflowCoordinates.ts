import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes.js'
import { failedWithResult, Result, successWith } from '../../../util/structuredResult.js'
import { logger } from '../../../util/logging.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import { invalidRequestResponse } from '../../htmlResponses.js'
import {
  GitHubWorkflowCoordinates,
  GitHubWorkflowCoordinatesSchema
} from '../../../types/GitHubCoordinateTypes.js'

export function parsePartialWorkflowCoordinates(
  event: CicadaAuthorizedAPIEvent
): Result<Partial<GitHubWorkflowCoordinates>, APIGatewayProxyResult> {
  const result = GitHubWorkflowCoordinatesSchema.partial().safeParse(event.queryStringParameters ?? {})
  if (result.success) {
    return successWith(result.data)
  }

  logger.warn('Invalid request in parsePartialWorkflowCoordinates')
  return failedWithResult('Invalid request', invalidRequestResponse)
}
