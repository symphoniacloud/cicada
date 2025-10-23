import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes.js'
import { JTDSchemaType } from 'ajv/dist/jtd.js'
import { failedWithResult, Result, successWith } from '../../../util/structuredResult.js'
import { logger } from '../../../util/logging.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import { invalidRequestResponse } from '../../htmlResponses.js'
import { RepoCoordinatesQueryStringParameters, repoCoordinatesSchema } from './parseRepoCoordinates.js'
import {
  GitHubWorkflowCoordinates,
  isGitHubWorkflowCoordinates
} from '../../../types/GitHubCoordinateTypes.js'
import { pickProperties } from '../../../util/collections.js'

export function parseWorkflowCoordinates(
  event: CicadaAuthorizedAPIEvent
): Result<GitHubWorkflowCoordinates, APIGatewayProxyResult> {
  if (isGitHubWorkflowCoordinates(event.queryStringParameters)) {
    return successWith(pickProperties(event.queryStringParameters, ['accountId', 'repoId', 'workflowId']))
  }
  logger.warn('Invalid request in getWorkflowCoordinates')
  return failedWithResult('Invalid request - no account ID', invalidRequestResponse)
}

export interface WorkflowCoordinatesQueryStringParameters extends RepoCoordinatesQueryStringParameters {
  workflowId: string
}

export const workflowCoordinatesSchema: JTDSchemaType<WorkflowCoordinatesQueryStringParameters> = {
  properties: {
    ...repoCoordinatesSchema.properties,
    workflowId: { type: 'string' }
  }
}
