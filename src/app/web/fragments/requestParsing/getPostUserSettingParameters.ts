import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes'
import { JTDSchemaType } from 'ajv/dist/jtd'
import { validatingQueryStringParser } from '../../../schema/urlPathParser'
import { failedWithResult, isFailure, Result, successWith } from '../../../util/structuredResult'
import { logger } from '../../../util/logging'
import { invalidRequestResponse } from '../../htmlResponses'
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy'
import { GithubAccountId, GithubRepoId, GithubWorkflowId } from '../../../domain/types/GithubKeys'
import { isUserSetting, UserSetting } from '../../../domain/types/UserSettings'

export function getPostUserSettingParameters(event: CicadaAuthorizedAPIEvent): Result<
  {
    accountId: GithubAccountId
    repoId?: GithubRepoId
    workflowId?: GithubWorkflowId
    setting: UserSetting
    enabled: boolean
  },
  APIGatewayProxyResult
> {
  const parseResult = parser(event.queryStringParameters)
  if (isFailure(parseResult)) {
    logger.warn('Invalid request in getPostUserSettingParameters', { reason: parseResult.reason })
    return failedWithResult('Failed to parse', invalidRequestResponse)
  }
  const { accountId, repoId, workflowId, setting, enabled } = parseResult.result
  if (!isUserSetting(setting)) {
    logger.warn(`Invalid request in getPostUserSettingParameters - setting ${setting} is not a valid setting`)
    return failedWithResult('Failed to parse', invalidRequestResponse)
  }

  // TODO - need to check valid types
  return successWith({
    accountId,
    setting,
    enabled: enabled.toLowerCase() === 'true',
    ...(repoId ? { repoId } : {}),
    ...(workflowId ? { workflowId } : {})
  })
}

export interface PostUserSettingsParameters {
  accountId: string
  repoId?: string
  workflowId?: string
  setting: string
  enabled: string
}

export const postUserSettingSchema: JTDSchemaType<PostUserSettingsParameters> = {
  properties: {
    accountId: { type: 'string' },
    setting: { type: 'string' },
    enabled: { type: 'string' }
  },
  optionalProperties: {
    repoId: { type: 'string' },
    workflowId: { type: 'string' }
  }
}

const parser = validatingQueryStringParser(postUserSettingSchema)
