import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes.js'
import { JTDSchemaType } from 'ajv/dist/jtd.js'
import { validatingQueryStringParser } from '../../../schema/urlPathParser.js'
import { failedWithResult, isFailure, Result, successWith } from '../../../util/structuredResult.js'
import { logger } from '../../../util/logging.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import { invalidRequestResponse } from '../../htmlResponses.js'
import { RepoCoordinatesQueryStringParameters, repoCoordinatesSchema } from './parseRepoCoordinates.js'
import { GithubAccountId, isGithubAccountId } from '../../../domain/types/GithubAccountId.js'
import { GithubRepoId, isGithubRepoId } from '../../../domain/types/GithubRepoId.js'
import { GithubWorkflowId, isGithubWorkflowId } from '../../../domain/types/GithubWorkflowId.js'

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
