import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes.js'
import { Result } from '../../../util/structuredResult.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import { GitHubAccountKey, GitHubRepoKey, GitHubWorkflowKey } from '../../../ioTypes/GitHubTypes.js'
import {
  GitHubAccountKeySchema,
  GitHubRepoKeySchema,
  GitHubWorkflowKeySchema
} from '../../../ioTypes/GitHubSchemas.js'

import { parsePartialQueryStringWithSchema, parseQueryStringWithSchema } from '../../htmlRequests.js'

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
