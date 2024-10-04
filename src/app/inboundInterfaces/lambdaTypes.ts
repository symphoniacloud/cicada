import {
  APIGatewayProxyEventHeaders,
  APIGatewayProxyEventMultiValueHeaders,
  APIGatewayProxyWithLambdaAuthorizerEvent
} from 'aws-lambda/trigger/api-gateway-proxy'
import { APIGatewayProxyEvent, APIGatewayProxyWithLambdaAuthorizerHandler } from 'aws-lambda'

import { GithubUserId } from '../domain/types/GithubUserId'
import { UserScopeReferenceData } from '../domain/types/UserScopeReferenceData'

export type WebAuthorizerContext = { username?: string; userId?: GithubUserId }

export type CicadaAPIAuthorizedAPIEvent = APIGatewayProxyWithLambdaAuthorizerEvent<WebAuthorizerContext>

export type CicadaAPIAuthorizedAPIHandler = APIGatewayProxyWithLambdaAuthorizerHandler<WebAuthorizerContext>

export type CicadaAuthorizedAPIEvent = APIGatewayProxyEvent & {
  refData: UserScopeReferenceData
  username: string
}

export type WithHeadersEvent = {
  headers: APIGatewayProxyEventHeaders | null
  multiValueHeaders: APIGatewayProxyEventMultiValueHeaders | null
}
