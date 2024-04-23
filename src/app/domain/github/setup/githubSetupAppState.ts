import { getEnvVarOrThrow } from '../../../environment/lambdaStartup'
import { SSM_PARAM_NAMES } from '../../../../multipleContexts/ssmParams'
import { paramsForAppName } from '../../../environment/config'

export interface GithubSetupAppState {
  appName: string
  webHostname: string
  webhookCode: string
  callbackState: string
}

export async function githubSetupStartup(): Promise<GithubSetupAppState> {
  const appName = getEnvVarOrThrow('APP_NAME')
  const params = paramsForAppName(appName)
  return {
    appName,
    webHostname: await params.getParam(SSM_PARAM_NAMES.WEB_HOSTNAME),
    webhookCode: await params.getParam(SSM_PARAM_NAMES.GITHUB_WEBHOOK_URL_CODE),
    callbackState: await params.getParam(SSM_PARAM_NAMES.GITHUB_CALLBACK_STATE)
  }
}
