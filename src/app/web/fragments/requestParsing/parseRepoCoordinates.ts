import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes.js'
import { failedWithResult, Result, successWith } from '../../../util/structuredResult.js'
import { logger } from '../../../util/logging.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import { invalidRequestResponse } from '../../htmlResponses.js'
import { GitHubRepoCoordinates, GitHubRepoCoordinatesSchema } from '../../../types/GitHubCoordinateTypes.js'
import { JTDSchemaType } from 'ajv/dist/jtd.js'

export function parseRepoCoordinates(
  event: CicadaAuthorizedAPIEvent
): Result<GitHubRepoCoordinates, APIGatewayProxyResult> {
  const result = GitHubRepoCoordinatesSchema.safeParse(event.queryStringParameters)
  if (result.success) {
    return successWith(result.data)
  }
  logger.warn('Invalid request in parseRepoCoordinates')
  return failedWithResult('Invalid request - no account ID', invalidRequestResponse)
}

// TODO remove these when no longer used
export interface RepoCoordinatesQueryStringParameters {
  accountId: string
  repoId: string
}

export const repoCoordinatesSchema: JTDSchemaType<RepoCoordinatesQueryStringParameters> = {
  properties: {
    accountId: { type: 'string' },
    repoId: { type: 'string' }
  }
}
