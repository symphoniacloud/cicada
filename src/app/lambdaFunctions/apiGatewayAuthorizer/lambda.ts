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
  generateApiGatewayAuthorizerResult
} from '../../domain/webAuth/apiGatewayAuthorizer'
import { WebAuthorizerContext } from '../../inboundInterfaces/lambdaTypes'

let appState: AppState

export const baseHandler: APIGatewayRequestAuthorizerWithContextHandler<WebAuthorizerContext> = async (
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerWithContextResult<WebAuthorizerContext>> => {
  if (!appState) {
    appState = await lambdaStartup()
  }
  try {
    return await attemptToAuthorize(appState, event)
  } catch (e) {
    logger.error('Error attempting to authorize', e as Error)
    return generateApiGatewayAuthorizerResult(event)
  }
}

// Entry point - usage is defined by CDK
// noinspection JSUnusedGlobalSymbols
export const handler = middy(baseHandler).use(powertoolsMiddlewares)
