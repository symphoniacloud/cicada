import { getEnvVarOrThrow } from '../../../environment/lambdaStartup'
import { paramsForAppName } from '../../../environment/config'
import { SSM_PARAM_NAMES } from '../../../../multipleContexts/ssmParams'

export async function githubAppIsReady() {
  const appName = getEnvVarOrThrow('APP_NAME')
  const params = paramsForAppName(appName)
  return (await params.getParamOrUndefined(SSM_PARAM_NAMES.GITHUB_APP_ID, { maxAge: 5 })) !== undefined
}
