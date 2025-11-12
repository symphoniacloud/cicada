import { logger } from '../../util/logging.js'
import { AppState } from '../../environment/AppState.js'
import { SSM_PARAM_NAMES } from '../../../multipleContexts/ssmParams.js'
import { paramsForAppName } from '../../environment/config.js'
import { failedWith, successWith } from '../../util/structuredResult.js'

export function isTestUserToken(token: string) {
  return token.indexOf('testuser') >= 0
}

const TEST_TOKEN_FAILURE = failedWith('Test Token failure')

export async function processTestToken(appState: AppState, token: string) {
  try {
    const { username, userId, secret } = JSON.parse(token)
    if (!(username && userId && secret)) {
      logger.info('Test token detected but invalid structure - return unauthorized')
      return TEST_TOKEN_FAILURE
    }
    const param = await paramsForAppName(appState.config.appName).getParamOrUndefined(
      SSM_PARAM_NAMES.TEST_COOKIE_SECRET
    )
    if (!param) {
      logger.info('Detected test token but no token configured - return unauthorized')
      return TEST_TOKEN_FAILURE
    }
    if (!(secret === param)) {
      logger.info('Invalid secret on test token - return unauthorized')
      return TEST_TOKEN_FAILURE
    }

    logger.info(`Valid test token - authorizing for ${username} / ${userId}`)
    return successWith({
      username,
      userId
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    logger.info('Error thrown while trying to process test token - return unauthorized')
    return TEST_TOKEN_FAILURE
  }
}
