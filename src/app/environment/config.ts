import { getParametersByName } from '@aws-lambda-powertools/parameters/ssm'
import { SSM_PARAM_NAMES, SsmParamName, ssmTableNamePath } from '../../multipleContexts/ssmParams.js'
import { throwFunction } from '../../multipleContexts/errors.js'
import { CICADA_TABLE_IDS, CicadaTableId } from '../../multipleContexts/dynamoDBTables.js'
import { SSMGetParametersByNameOptions } from '@aws-lambda-powertools/parameters/ssm/types'
import { isGitHubAppId } from '../types/GitHubTypeChecks.js'
import { GitHubAppId } from '../types/GitHubTypes.js'

// Some of these are async because implementations may cache values retrieved from external services
export interface CicadaConfig {
  appName: string

  tableNames(): Promise<TableNames>

  github(): Promise<GithubConfig>

  webPush(): Promise<WebPushVapidConfig>

  webHostname(): Promise<string>
}

export type TableNames = Record<CicadaTableId, string>

export interface GithubConfig {
  readonly appId: GitHubAppId
  readonly clientId: string
  readonly githubCallbackState: string
  readonly privateKey: string
  readonly clientSecret: string
  readonly webhookSecret: string
}

export interface WebPushVapidConfig {
  readonly publicKey: string
  readonly privateKey: string
  readonly subject: string
}

// Configuration is primarily stored in AWS SSM parameters, accessed via Lambda Powertools Parameters
// (see https://docs.powertools.aws.dev/lambda/typescript/latest/utilities/parameters/)
// In the Lambda environment `appName` is stored as an environment variable
export function realCicadaConfig(appName: string): CicadaConfig {
  const params = paramsForAppName(appName)

  return {
    appName,
    async github() {
      const appId = await params.getParam(SSM_PARAM_NAMES.GITHUB_APP_ID)
      if (!isGitHubAppId(appId)) throw new Error(`Invalid Github App ID: ${appId}`)
      return {
        appId: appId,
        clientId: await params.getParam(SSM_PARAM_NAMES.GITHUB_CLIENT_ID),
        githubCallbackState: await params.getParam(SSM_PARAM_NAMES.GITHUB_CALLBACK_STATE),
        privateKey: await params.getParam(SSM_PARAM_NAMES.GITHUB_PRIVATE_KEY),
        clientSecret: await params.getParam(SSM_PARAM_NAMES.GITHUB_CLIENT_SECRET),
        webhookSecret: await params.getParam(SSM_PARAM_NAMES.GITHUB_WEBHOOK_SECRET)
      }
    },
    async webPush() {
      return {
        publicKey: await params.getParam(SSM_PARAM_NAMES.WEB_PUSH_VAPID_PUBLIC_KEY),
        privateKey: await params.getParam(SSM_PARAM_NAMES.WEB_PUSH_VAPID_PRIVATE_KEY),
        subject: await params.getParam(SSM_PARAM_NAMES.WEB_PUSH_SUBJECT)
      }
    },
    async webHostname() {
      return await params.getParam(SSM_PARAM_NAMES.WEB_HOSTNAME)
    },
    async tableNames() {
      return Object.fromEntries(
        await Promise.all(
          CICADA_TABLE_IDS.map(async (id) => [id, await params.getParam(ssmTableNamePath(id))])
        )
      )
    }
  }
}

export function paramsForAppName(appName: string) {
  async function getAppParam(
    paramName: SsmParamName,
    overrides?: SSMGetParametersByNameOptions
  ): Promise<string | undefined> {
    const fullKey = `/${appName}/${paramName}`
    // Powertools will cache this value using the POWERTOOLS_PARAMETERS_MAX_AGE environment variable (see environmentSettings.ts)
    const { _errors: errors, ...parameters } = await getParametersByName(
      {
        [fullKey]: {}
      },
      { decrypt: true, throwOnError: false, ...overrides }
    )

    if (errors && errors.length) {
      return undefined
    }

    const result = parameters[fullKey]
    if (!result)
      throw new Error(
        `Unexpected error - getParametersByName didn't contain error for ${fullKey} but it didn't appear in result`
      )
    if (typeof result !== 'string')
      throw new Error(
        `Unexpected error - getParametersByName returned non string result for ${fullKey} : ${result}`
      )
    return result
  }

  return {
    getParam: async (paramName: SsmParamName, overrides?: SSMGetParametersByNameOptions) => {
      return (
        (await getAppParam(paramName, overrides)) ?? throwFunction(`app param name ${paramName} not found`)()
      )
    },
    getParamOrUndefined: async (paramName: SsmParamName, overrides?: SSMGetParametersByNameOptions) => {
      return await getAppParam(paramName, overrides)
    }
  }
}
