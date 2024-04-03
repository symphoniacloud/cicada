import { AppState } from '../../environment/AppState'
import {
  APIGatewayAuthorizerWithContextResult,
  APIGatewayRequestAuthorizerEvent
} from 'aws-lambda/trigger/api-gateway-authorizer'
import { logger } from '../../util/logging'
import { WebAuthorizerContext } from '../../inboundInterfaces/lambdaTypes'
import { authorizeUserRequest } from './userAuthorizer'

export async function attemptToAuthorize(
  appState: AppState,
  event: APIGatewayRequestAuthorizerEvent
): Promise<APIGatewayAuthorizerWithContextResult<WebAuthorizerContext>> {
  const authResult = await authorizeUserRequest(appState, event)

  if (!authResult) {
    return generateApiGatewayAuthorizerResult(event)
  }

  return generateApiGatewayAuthorizerResult(event, {
    username: authResult.username,
    // See comment on WebAuthorizerContext for why we convert this to string
    userId: `${authResult.userId}`
  })
}

export function generateApiGatewayAuthorizerResult(
  event: APIGatewayRequestAuthorizerEvent,
  outputContext?: WebAuthorizerContext
): APIGatewayAuthorizerWithContextResult<WebAuthorizerContext> {
  if (outputContext) {
    logger.debug(`Returning Allow response for found user ${outputContext.username}`)
  } else {
    logger.debug('Returning Deny response')
  }

  return {
    principalId: 'restAuthorizer',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: outputContext ? 'Allow' : 'Deny',
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
