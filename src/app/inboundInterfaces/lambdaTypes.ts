import {
  APIGatewayProxyEventHeaders,
  APIGatewayProxyEventMultiValueHeaders,
  APIGatewayProxyWithLambdaAuthorizerEvent
} from 'aws-lambda'
import { APIGatewayProxyEvent, APIGatewayProxyWithLambdaAuthorizerHandler } from 'aws-lambda'

import { GitHubUserId } from '../ioTypes/GitHubTypes.js'
import { UserScopeReferenceData } from '../domain/types/internalTypes.js'

export type WebAuthorizerContext = { username?: string; userId?: GitHubUserId }

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
