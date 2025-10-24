import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes.js'
import { failedWithResult, Result, successWith } from '../../../util/structuredResult.js'
import { logger } from '../../../util/logging.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import { invalidRequestResponse } from '../../htmlResponses.js'
import { GitHubAccountKey, GitHubRepoKey, GitHubWorkflowKey } from '../../../types/GitHubTypes.js'
import { z } from 'zod'
import {
  GitHubAccountKeySchema,
  GitHubRepoKeySchema,
  GitHubWorkflowKeySchema
} from '../../../types/schemas/GitHubSchemas.js'

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

export function parsePartialRepoKeyFromQueryString(
  event: CicadaAuthorizedAPIEvent
): Result<Partial<GitHubRepoKey>, APIGatewayProxyResult> {
  return parsePartialQueryStringWithSchema(event, GitHubRepoKeySchema, 'parsePartialRepoCoordinates')
}

export function parsePartialWorkflowKeyFromQueryString(
  event: CicadaAuthorizedAPIEvent
): Result<Partial<GitHubWorkflowKey>, APIGatewayProxyResult> {
  return parsePartialQueryStringWithSchema(event, GitHubWorkflowKeySchema, 'parsePartialWorkflowCoordinates')
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

function parsePartialQueryStringWithSchema<T extends z.ZodObject<z.ZodRawShape>>(
  event: CicadaAuthorizedAPIEvent,
  schema: T,
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
