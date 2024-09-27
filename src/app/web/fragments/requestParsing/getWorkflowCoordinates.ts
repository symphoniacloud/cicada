import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes'
import { JTDSchemaType } from 'ajv/dist/jtd'
import { validatingQueryStringParser } from '../../../schema/urlPathParser'
import { failedWithResult, isFailure, Result, successWith } from '../../../util/structuredResult'
import { logger } from '../../../util/logging'
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy'
import { invalidRequestResponse } from '../../htmlResponses'
import { RepoCoordinatesQueryStringParameters, repoCoordinatesSchema } from './getRepoCoordinates'

export function getWorkflowCoordinates(
  event: CicadaAuthorizedAPIEvent
): Result<{ accountId: number; repoId: number; workflowId: number }, APIGatewayProxyResult> {
  const parseResult = qsParser(event.queryStringParameters)
  if (isFailure(parseResult)) {
    logger.warn('Invalid request in getWorkflowCoordinates', { reason: parseResult.reason })
    return failedWithResult('Failed to parse', invalidRequestResponse)
  }

  // TODO - can we just define the schema with ints?
  const { accountId, repoId, workflowId } = parseResult.result
  return successWith({
    accountId: parseInt(accountId),
    repoId: parseInt(repoId),
    workflowId: parseInt(workflowId)
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
