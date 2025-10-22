import { getEnvVarOrThrow } from '../../../environment/lambdaStartup.js'
import { paramsForAppName } from '../../../environment/config.js'
import { SSM_PARAM_NAMES } from '../../../../multipleContexts/ssmParams.js'

export async function githubAppIsReady() {
  const appName = getEnvVarOrThrow('APP_NAME')
  const params = paramsForAppName(appName)
  return (await params.getParamOrUndefined(SSM_PARAM_NAMES.GITHUB_APP_ID, { maxAge: 5 })) !== undefined
}
