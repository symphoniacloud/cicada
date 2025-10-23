import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes.js'
import { failedWithResult, Result, successWith } from '../../../util/structuredResult.js'
import { logger } from '../../../util/logging.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import { invalidRequestResponse } from '../../htmlResponses.js'
import { GitHubRepoCoordinates, isGitHubRepoCoordinates } from '../../../types/GitHubCoordinateTypes.js'
import { JTDSchemaType } from 'ajv/dist/jtd.js'
import { pickProperties } from '../../../util/collections.js'

export function parseRepoCoordinates(
  event: CicadaAuthorizedAPIEvent
): Result<GitHubRepoCoordinates, APIGatewayProxyResult> {
  if (isGitHubRepoCoordinates(event.queryStringParameters)) {
    return successWith(pickProperties(event.queryStringParameters, ['accountId', 'repoId']))
  }
  logger.warn('Invalid request in getRepoCoordinates')
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
