import { CicadaAuthorizedAPIEvent } from '../../../inboundInterfaces/lambdaTypes.js'
import { JTDSchemaType } from 'ajv/dist/jtd.js'
import { validatingQueryStringParser } from '../../../schema/urlPathParser.js'
import { failedWithResult, isFailure, Result, successWith } from '../../../util/structuredResult.js'
import { logger } from '../../../util/logging.js'
import { invalidRequestResponse } from '../../htmlResponses.js'
import { APIGatewayProxyResult } from 'aws-lambda'
import { isUserSetting, UserSetting } from '../../../domain/types/UserSettings.js'
import { GithubAccountId, isGithubAccountId } from '../../../domain/types/GithubAccountId.js'
import { GithubRepoId, isGithubRepoId } from '../../../domain/types/GithubRepoId.js'
import { GithubWorkflowId, isGithubWorkflowId } from '../../../domain/types/GithubWorkflowId.js'

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
  // TOEventually - put this into AJV parser
  if (!isGithubAccountId(accountId)) {
    logger.warn('Invalid request in getPostUserSettingParameters', { reason: 'Invalid type of Account ID' })
    return failedWithResult('Invalid type of Account ID', invalidRequestResponse)
  }
  if (repoId) {
    if (!isGithubRepoId(repoId)) {
      logger.warn('Invalid request in getPostUserSettingParameters', { reason: 'Invalid type of Repo ID' })
      return failedWithResult('Invalid type of Repo ID', invalidRequestResponse)
    }
    if (workflowId) {
      if (!isGithubWorkflowId(workflowId)) {
        logger.warn('Invalid request in getPostUserSettingParameters', {
          reason: 'Invalid type of Workflow ID'
        })
        return failedWithResult('Invalid type of Workflow ID', invalidRequestResponse)
      }
      return successWith({
        accountId,
        repoId,
        workflowId,
        setting,
        enabled: enabled.toLowerCase() === 'true'
      })
    }
    return successWith({
      accountId,
      repoId,
      setting,
      enabled: enabled.toLowerCase() === 'true'
    })
  }

  return successWith({
    accountId,
    setting,
    enabled: enabled.toLowerCase() === 'true'
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
