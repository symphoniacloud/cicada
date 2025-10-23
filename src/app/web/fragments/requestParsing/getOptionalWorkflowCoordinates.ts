import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes.js'
import { JTDSchemaType } from 'ajv/dist/jtd.js'
import { validatingQueryStringParser } from '../../../schema/urlPathParser.js'
import {
  failedWith,
  failedWithResult,
  isFailure,
  Result,
  successWith
} from '../../../util/structuredResult.js'
import { logger } from '../../../util/logging.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import { invalidRequestResponse } from '../../htmlResponses.js'
import {
  WorkflowCoordinatesQueryStringParameters,
  workflowCoordinatesSchema
} from './parseWorkflowCoordinates.js'
import { GithubAccountId, isGithubAccountId } from '../../../domain/types/GithubAccountId.js'
import { GithubRepoId, isGithubRepoId } from '../../../domain/types/GithubRepoId.js'
import { GithubWorkflowId, isGithubWorkflowId } from '../../../domain/types/GithubWorkflowId.js'

export function getOptionalWorkflowCoordinates(
  event: CicadaAuthorizedAPIEvent
): Result<
  { accountId?: GithubAccountId; repoId?: GithubRepoId; workflowId?: GithubWorkflowId },
  APIGatewayProxyResult
> {
  const parseResult = parser(event.queryStringParameters ?? {})
  if (isFailure(parseResult)) {
    logger.warn('Invalid request in getOptionalWorkflowCoordinates', { reason: parseResult.reason })
    return failedWithResult('Failed to parse', invalidRequestResponse)
  }

  const { accountId, repoId, workflowId } = parseResult.result
  const accountIdCheck = checkAccountId(accountId)
  const repoIdCheck = checkRepoId(repoId)
  const workflowIdCheck = checkWorkflowId(workflowId)

  // TOEventually - put this into AJV parser
  if (isFailure(accountIdCheck)) {
    logger.warn('Invalid request in getOptionalWorkflowCoordinates', { reason: accountIdCheck.reason })
    return failedWithResult('Failed to parse', invalidRequestResponse)
  }
  if (isFailure(repoIdCheck)) {
    logger.warn('Invalid request in getOptionalWorkflowCoordinates', { reason: repoIdCheck.reason })
    return failedWithResult('Failed to parse', invalidRequestResponse)
  }
  if (isFailure(workflowIdCheck)) {
    logger.warn('Invalid request in getOptionalWorkflowCoordinates', { reason: workflowIdCheck.reason })
    return failedWithResult('Failed to parse', invalidRequestResponse)
  }
  return successWith({
    accountId: accountIdCheck.result,
    repoId: repoIdCheck.result,
    workflowId: workflowIdCheck.result
  })
}

export type OptionalWorkflowCoordinatesQueryStringParameters =
  Partial<WorkflowCoordinatesQueryStringParameters>

export const optionalWorkflowCoordinatesSchema: JTDSchemaType<OptionalWorkflowCoordinatesQueryStringParameters> =
  {
    optionalProperties: workflowCoordinatesSchema.properties
  }

const parser = validatingQueryStringParser(optionalWorkflowCoordinatesSchema)

export function checkAccountId(accountId?: string): Result<GithubAccountId | undefined> {
  if (!accountId) return successWith(undefined)
  if (isGithubAccountId(accountId)) return successWith(accountId)
  return failedWith('Invalid type of Account ID')
}

export function checkRepoId(repoId?: string): Result<GithubRepoId | undefined> {
  if (!repoId) return successWith(undefined)
  if (isGithubRepoId(repoId)) return successWith(repoId)
  return failedWith('Invalid type of Repo ID')
}

export function checkWorkflowId(workflowId?: string): Result<GithubWorkflowId | undefined> {
  if (!workflowId) return successWith(undefined)
  if (isGithubWorkflowId(workflowId)) return successWith(workflowId)
  return failedWith('Invalid type of Workflow ID')
}
