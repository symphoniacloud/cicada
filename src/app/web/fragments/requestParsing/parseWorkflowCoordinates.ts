import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes.js'
import { failedWithResult, Result, successWith } from '../../../util/structuredResult.js'
import { logger } from '../../../util/logging.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import { invalidRequestResponse } from '../../htmlResponses.js'
import {
  GitHubWorkflowCoordinates,
  GitHubWorkflowCoordinatesSchema
} from '../../../types/GitHubCoordinateTypes.js'

export function parseWorkflowCoordinates(
  event: CicadaAuthorizedAPIEvent
): Result<GitHubWorkflowCoordinates, APIGatewayProxyResult> {
  const result = GitHubWorkflowCoordinatesSchema.safeParse(event.queryStringParameters)
  if (result.success) {
    return successWith(result.data)
  }
  logger.warn('Invalid request in parseWorkflowCoordinates')
  return failedWithResult('Invalid request - no account ID', invalidRequestResponse)
}
