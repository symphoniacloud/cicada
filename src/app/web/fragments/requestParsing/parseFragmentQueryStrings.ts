import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes.js'
import { failedWithResult, Result, successWith } from '../../../util/structuredResult.js'
import { logger } from '../../../util/logging.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import { invalidRequestResponse } from '../../htmlResponses.js'
import { GitHubAccountKey, GitHubRepoKey, GitHubWorkflowKey } from '../../../ioTypes/GitHubTypes.js'
import { z } from 'zod'
import {
  GitHubAccountKeySchema,
  GitHubRepoKeySchema,
  GitHubWorkflowKeySchema
} from '../../../ioTypes/GitHubSchemas.js'

import { parseQueryStringWithSchema } from '../../htmlRequests.js'

export function parseAccountKeyFromQueryString(
  event: CicadaAuthorizedAPIEvent
): Result<GitHubAccountKey, APIGatewayProxyResult> {
  return parseQueryStringWithSchema(GitHubAccountKeySchema, event, 'parseAccountCoordinates')
}

export function parseRepoKeyFromQueryString(
  event: CicadaAuthorizedAPIEvent
): Result<GitHubRepoKey, APIGatewayProxyResult> {
  return parseQueryStringWithSchema(GitHubRepoKeySchema, event, 'parseRepoCoordinates')
}

export function parseWorkflowKeyFromQueryString(
  event: CicadaAuthorizedAPIEvent
): Result<GitHubWorkflowKey, APIGatewayProxyResult> {
  return parseQueryStringWithSchema(GitHubWorkflowKeySchema, event, 'parseWorkflowCoordinates')
}

export function parsePartialRepoKeyFromQueryString(
  event: CicadaAuthorizedAPIEvent
): Result<Partial<GitHubRepoKey>, APIGatewayProxyResult> {
  return parsePartialQueryStringWithSchema(GitHubRepoKeySchema.unwrap(), event, 'parsePartialRepoCoordinates')
}

export function parsePartialWorkflowKeyFromQueryString(
  event: CicadaAuthorizedAPIEvent
): Result<Partial<GitHubWorkflowKey>, APIGatewayProxyResult> {
  return parsePartialQueryStringWithSchema(
    GitHubWorkflowKeySchema.unwrap(),
    event,
    'parsePartialWorkflowCoordinates'
  )
}

function parsePartialQueryStringWithSchema<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
  event: CicadaAuthorizedAPIEvent,
  errorContext: string
): Result<Partial<z.infer<T>>, APIGatewayProxyResult> {
  const params = event.queryStringParameters ?? {}
  const result = schema.partial().safeParse(params)
  if (result.success) {
    // Safe cast: schema.partial().safeParse() returns Partial<z.infer<T>> by design
    return successWith(result.data as Partial<z.infer<T>>)
  }

  logger.warn(`Invalid request in ${errorContext}`)
  return failedWithResult('Invalid request', invalidRequestResponse)
}
