import { AppState } from '../../environment/AppState'
import {
  APIGatewayAuthorizerWithContextResult,
  APIGatewayRequestAuthorizerEvent,
  StatementEffect
} from 'aws-lambda/trigger/api-gateway-authorizer'
import { logger } from '../../util/logging'
import { WebAuthorizerContext } from '../../inboundInterfaces/lambdaTypes'
import { authorizeUserRequest } from './userAuthorizer'

export async function attemptToAuthorize(
  appState: AppState,
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerWithContextResult<WebAuthorizerContext>> {
  const authResult = await authorizeUserRequest(appState, event)

  return authResult
    ? generateApiGatewayAllowAuthorizerResult(event, authResult)
    : generateApiGatewayDenyAuthorizerResult(event)
}

export function generateApiGatewayAllowAuthorizerResult(
  event: APIGatewayRequestAuthorizerEvent,
  outputContext: WebAuthorizerContext
): APIGatewayAuthorizerWithContextResult<WebAuthorizerContext> {
  logger.debug(`Returning Allow response for found user ${outputContext.username}`)
  return generateApiGatewayAuthorizerResult(event, 'Allow', outputContext)
}

export function generateApiGatewayDenyAuthorizerResult(
  event: APIGatewayRequestAuthorizerEvent
): APIGatewayAuthorizerWithContextResult<WebAuthorizerContext> {
  logger.debug('Returning Deny response')
  return generateApiGatewayAuthorizerResult(event, 'Deny', {})
}

export function generateApiGatewayAuthorizerResult(
  event: APIGatewayRequestAuthorizerEvent,
  effect: StatementEffect,
  outputContext: WebAuthorizerContext
): APIGatewayAuthorizerWithContextResult<WebAuthorizerContext> {
  return {
    principalId: 'restAuthorizer',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: generateResource(event.methodArn)
        }
      ]
    },
    // Means that the user details are available to target lambda function
    context: outputContext ?? {}
  }
}

export function generateResource(methodArn: string) {
  return `${methodArn.substring(0, methodArn.indexOf('/') + 1)}*`
}
