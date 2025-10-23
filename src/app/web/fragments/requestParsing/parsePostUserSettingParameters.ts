import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes.js'
import { failedWithResult, Result, successWith } from '../../../util/structuredResult.js'
import { logger } from '../../../util/logging.js'
import { invalidRequestResponse } from '../../htmlResponses.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import {
  PostUserSettingsParameters,
  PostUserSettingsParametersSchema
} from '../../../types/PostUserSettingsParametersType.js'

export function parsePostUserSettingParameters(
  event: CicadaAuthorizedAPIEvent
): Result<PostUserSettingsParameters, APIGatewayProxyResult> {
  const result = PostUserSettingsParametersSchema.safeParse(event.queryStringParameters)
  if (result.success) {
    return successWith(result.data)
  }

  logger.warn('Invalid request in parsePostUserSettingParameters')
  return failedWithResult('Invalid request', invalidRequestResponse)
}
