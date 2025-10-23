import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes.js'
import { failedWithResult, Result, successWith } from '../../../util/structuredResult.js'
import { logger } from '../../../util/logging.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import { invalidRequestResponse } from '../../htmlResponses.js'
import {
  GitHubAccountKey,
  GitHubAccountKeySchema,
  GitHubRepoKey,
  GitHubRepoKeySchema,
  GitHubWorkflowKey,
  GitHubWorkflowKeySchema
} from '../../../types/GitHubKeyTypes.js'
import { z } from 'zod'

export function parseAccountKeyFromQueryString(
  event: CicadaAuthorizedAPIEvent
): Result<GitHubAccountKey, APIGatewayProxyResult> {
  return parseQueryStringWithSchema(event, GitHubAccountKeySchema, 'parseAccountCoordinates')
}

export function parseRepoKeyFromQueryString(
  event: CicadaAuthorizedAPIEvent
): Result<GitHubRepoKey, APIGatewayProxyResult> {
  return parseQueryStringWithSchema(event, GitHubRepoKeySchema, 'parseRepoCoordinates')
}

export function parseWorkflowKeyFromQueryString(
  event: CicadaAuthorizedAPIEvent
): Result<GitHubWorkflowKey, APIGatewayProxyResult> {
  return parseQueryStringWithSchema(event, GitHubWorkflowKeySchema, 'parseWorkflowCoordinates')
}

function parseQueryStringWithSchema<T extends z.ZodTypeAny>(
  event: CicadaAuthorizedAPIEvent,
  schema: T,
  errorContext: string
): Result<z.infer<T>, APIGatewayProxyResult> {
  const result = schema.safeParse(event.queryStringParameters)
  if (result.success) {
    return successWith(result.data)
  }

  logger.warn(`Invalid request in ${errorContext}`)
  return failedWithResult('Invalid request', invalidRequestResponse)
}
