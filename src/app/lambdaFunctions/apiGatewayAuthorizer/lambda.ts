import {
  APIGatewayAuthorizerWithContextResult,
  APIGatewayRequestAuthorizerEvent,
  APIGatewayRequestAuthorizerWithContextHandler
} from 'aws-lambda'
import middy from '@middy/core'
import { lambdaStartup } from '../../environment/lambdaStartup.js'
import { AppState } from '../../environment/AppState.js'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware.js'
import { logger } from '../../util/logging.js'
import {
  attemptToAuthorize,
  generateApiGatewayDenyAuthorizerResult
} from '../../domain/webAuth/apiGatewayAuthorizer.js'
import { WebAuthorizerContext } from '../../inboundInterfaces/lambdaTypes.js'
import { isFailure } from '../../util/structuredResult.js'

let appState: AppState

export const baseHandler: APIGatewayRequestAuthorizerWithContextHandler<WebAuthorizerContext> = async (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerWithContextResult<WebAuthorizerContext>> => {
  if (!appState) {
    const startup = await lambdaStartup()

    if (isFailure(startup)) {
      logger.info('Github App not ready, not authorizing user')
      return generateApiGatewayDenyAuthorizerResult(event)
    }

    appState = startup.result
  }

  try {
    return await attemptToAuthorize(appState, event)
  } catch (e) {
    logger.error('Error attempting to authorize', e as Error)
    return generateApiGatewayDenyAuthorizerResult(event)
  }
}

// Entry point - usage is defined by CDK
// noinspection JSUnusedGlobalSymbols
export const handler = middy(baseHandler).use(powertoolsMiddlewares)
