import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes'
import { JTDSchemaType } from 'ajv/dist/jtd'
import { validatingQueryStringParser } from '../../../schema/urlPathParser'
import { failedWithResult, isFailure, Result, successWith } from '../../../util/structuredResult'
import { logger } from '../../../util/logging'
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy'
import { invalidRequestResponse } from '../../htmlResponses'
import { WorkflowCoordinatesQueryStringParameters, workflowCoordinatesSchema } from './getWorkflowCoordinates'

export function getOptionalWorkflowCoordinates(
  event: CicadaAuthorizedAPIEvent
): Result<{ ownerId?: number; repoId?: number; workflowId?: number }, APIGatewayProxyResult> {
  const parseResult = parser(event.queryStringParameters ?? {})
  if (isFailure(parseResult)) {
    logger.warn('Invalid request in getOptionalWorkflowCoordinates', { reason: parseResult.reason })
    return failedWithResult('Failed to parse', invalidRequestResponse)
  }

  // TODO - can we just define the schema with ints?
  const { ownerId, repoId, workflowId } = parseResult.result
  return successWith({
    ...(ownerId ? { ownerId: parseInt(ownerId) } : {}),
    ...(repoId ? { repoId: parseInt(repoId) } : {}),
    ...(workflowId ? { workflowId: parseInt(workflowId) } : {})
  })
}

export type OptionalWorkflowCoordinatesQueryStringParameters =
  Partial<WorkflowCoordinatesQueryStringParameters>

export const optionalWorkflowCoordinatesSchema: JTDSchemaType<OptionalWorkflowCoordinatesQueryStringParameters> =
  {
    optionalProperties: workflowCoordinatesSchema.properties
  }

const parser = validatingQueryStringParser(optionalWorkflowCoordinatesSchema)
