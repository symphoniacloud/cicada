import { getParameter } from '@aws-lambda-powertools/parameters/ssm'
import { SSM_PARAM_NAMES, SsmParamName, ssmTableNamePath } from '../../multipleContexts/ssmParams'
import { throwFunction } from '../../multipleContexts/errors'
import { CICADA_TABLE_IDS, CicadaTableId } from '../../multipleContexts/dynamoDBTables'

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
  readonly appId: string
  readonly clientId: string
  readonly loginCallbackState: string
  readonly allowedInstallationAccountName: string
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
  // Powertools will cache this value using the POWERTOOLS_PARAMETERS_MAX_AGE environment variable (see environmentSettings.ts)
  // If a lower ttl value is used then call powertools library specifically for that key
  async function getApplicationParam(paramName: SsmParamName) {
    return (
      (await getParameter(`/${appName}/${paramName}`, { decrypt: true })) ??
      throwFunction(`app param name ${paramName} not found`)()
    )
  }

  return {
    appName,
    async github() {
      return {
        appId: await getApplicationParam(SSM_PARAM_NAMES.GITHUB_APP_ID),
        clientId: await getApplicationParam(SSM_PARAM_NAMES.GITHUB_CLIENT_ID),
        loginCallbackState: await getApplicationParam(SSM_PARAM_NAMES.GITHUB_LOGIN_CALLBACK_STATE),
        allowedInstallationAccountName: await getApplicationParam(
          SSM_PARAM_NAMES.CONFIG_ALLOWED_INSTALLATION_ACCOUNT_NAME
        ),
        privateKey: await getApplicationParam(SSM_PARAM_NAMES.GITHUB_PRIVATE_KEY),
        clientSecret: await getApplicationParam(SSM_PARAM_NAMES.GITHUB_CLIENT_SECRET),
        webhookSecret: await getApplicationParam(SSM_PARAM_NAMES.GITHUB_WEBHOOK_SECRET)
      }
    },
    async webPush() {
      return {
        publicKey: await getApplicationParam(SSM_PARAM_NAMES.WEB_PUSH_VAPID_PUBLIC_KEY),
        privateKey: await getApplicationParam(SSM_PARAM_NAMES.WEB_PUSH_VAPID_PRIVATE_KEY),
        subject: await getApplicationParam(SSM_PARAM_NAMES.WEB_PUSH_SUBJECT)
      }
    },
    async webHostname() {
      return await getApplicationParam(SSM_PARAM_NAMES.WEB_HOSTNAME)
    },
    async tableNames() {
      return Object.fromEntries(
        await Promise.all(
          CICADA_TABLE_IDS.map(async (id) => [id, await getApplicationParam(ssmTableNamePath(id))])
        )
      )
    }
  }
}
