import { logger } from '../../util/logging'
import { AppState } from '../../environment/AppState'
import { SSM_PARAM_NAMES } from '../../../multipleContexts/ssmParams'
import { paramsForAppName } from '../../environment/config'

export function isTestUserToken(token: string) {
  return token.indexOf('testuser') >= 0
}

export async function processTestToken(appState: AppState, token: string) {
  try {
    const { username, userId, secret } = JSON.parse(token)
    if (!(username && userId && secret)) {
      logger.info('Test token detected but invalid structure - return unauthorized')
      return undefined
    }
    const param = await paramsForAppName(appState.config.appName).getParamOrUndefined(
      SSM_PARAM_NAMES.TEST_COOKIE_SECRET
    )
    if (!param) {
      logger.info('Detected test token but no token configured - return unauthorized')
      return undefined
    }
    if (!(secret === param)) {
      logger.info('Invalid secret on test token - return unauthorized')
      return undefined
    }

    logger.info(`Valid test token - authorizing for ${username} / ${userId}`)
    return {
      username,
      userId
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    logger.info('Error thrown while trying to process test token - return unauthorized')
    return undefined
  }
}
