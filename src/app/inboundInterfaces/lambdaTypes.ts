import {
  APIGatewayProxyEventHeaders,
  APIGatewayProxyEventMultiValueHeaders,
  APIGatewayProxyWithLambdaAuthorizerEvent
} from 'aws-lambda/trigger/api-gateway-proxy'
import { APIGatewayProxyEvent, APIGatewayProxyWithLambdaAuthorizerHandler } from 'aws-lambda'

// We store userId in database as a number (because it's a number on the GitHub API),
// but REST API Gateway converts all authorizer values to strings.
export type WebAuthorizerContext = { username?: string; userId?: string }

export type CicadaAPIAuthorizedAPIEvent = APIGatewayProxyWithLambdaAuthorizerEvent<WebAuthorizerContext>

export type CicadaAPIAuthorizedAPIHandler = APIGatewayProxyWithLambdaAuthorizerHandler<WebAuthorizerContext>

export type CicadaAuthorizedAPIEvent = APIGatewayProxyEvent & { username: string; userId: number }

export type WithHeadersEvent = {
  headers: APIGatewayProxyEventHeaders | null
  multiValueHeaders: APIGatewayProxyEventMultiValueHeaders | null
}
