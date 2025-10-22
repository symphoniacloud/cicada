import {
  APIGatewayProxyEventHeaders,
  APIGatewayProxyEventMultiValueHeaders,
  APIGatewayProxyWithLambdaAuthorizerEvent
} from 'aws-lambda'
import { APIGatewayProxyEvent, APIGatewayProxyWithLambdaAuthorizerHandler } from 'aws-lambda'

import { GithubUserId } from '../domain/types/GithubUserId.js'
import { UserScopeReferenceData } from '../domain/types/UserScopeReferenceData.js'

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
