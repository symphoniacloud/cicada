import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes'
import { JTDSchemaType } from 'ajv/dist/jtd'
import { validatingQueryStringParser } from '../../../schema/urlPathParser'
import { failedWithResult, isFailure, Result, successWith } from '../../../util/structuredResult'
import { logger } from '../../../util/logging'
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy'
import { invalidRequestResponse } from '../../htmlResponses'
import { RepoCoordinatesQueryStringParameters, repoCoordinatesSchema } from './getRepoCoordinates'
import { GithubAccountId, isGithubAccountId } from '../../../domain/types/GithubAccountId'
import { GithubRepoId, isGithubRepoId } from '../../../domain/types/GithubRepoId'
import { GithubWorkflowId, isGithubWorkflowId } from '../../../domain/types/GithubWorkflowId'

export function getWorkflowCoordinates(
  event: CicadaAuthorizedAPIEvent
): Result<
  { accountId: GithubAccountId; repoId: GithubRepoId; workflowId: GithubWorkflowId },
  APIGatewayProxyResult
> {
  const parseResult = qsParser(event.queryStringParameters)
  if (isFailure(parseResult)) {
    logger.warn('Invalid request in getWorkflowCoordinates', { reason: parseResult.reason })
    return failedWithResult('Failed to parse', invalidRequestResponse)
  }

  const { accountId, repoId, workflowId } = parseResult.result
  // TOEventually - put this into AJV parser
  if (!isGithubAccountId(accountId)) {
    logger.warn('Invalid request in getWorkflowCoordinates', { reason: 'Invalid type of Account ID' })
    return failedWithResult('Invalid type of Account ID', invalidRequestResponse)
  }
  if (!isGithubRepoId(repoId)) {
    logger.warn('Invalid request in getWorkflowCoordinates', { reason: 'Invalid type of Repo ID' })
    return failedWithResult('Invalid type of Repo ID', invalidRequestResponse)
  }
  if (!isGithubWorkflowId(workflowId)) {
    logger.warn('Invalid request in getWorkflowCoordinates', { reason: 'Invalid type of Workflow ID' })
    return failedWithResult('Invalid type of Workflow ID', invalidRequestResponse)
  }
  return successWith({
    accountId,
    repoId,
    workflowId
  })
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

const qsParser = validatingQueryStringParser(workflowCoordinatesSchema)
