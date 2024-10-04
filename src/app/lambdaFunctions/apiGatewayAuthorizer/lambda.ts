import {
  APIGatewayAuthorizerWithContextResult,
  APIGatewayRequestAuthorizerEvent,
  APIGatewayRequestAuthorizerWithContextHandler
} from 'aws-lambda/trigger/api-gateway-authorizer'
import middy from '@middy/core'
import { lambdaStartup } from '../../environment/lambdaStartup'
import { AppState } from '../../environment/AppState'
import { powertoolsMiddlewares } from '../../middleware/standardMiddleware'
import { logger } from '../../util/logging'
import {
  attemptToAuthorize,
  generateApiGatewayDenyAuthorizerResult
} from '../../domain/webAuth/apiGatewayAuthorizer'
import { WebAuthorizerContext } from '../../inboundInterfaces/lambdaTypes'
import { isFailure } from '../../util/structuredResult'

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
