import { APIGatewayEventDefaultAuthorizerContext } from 'aws-lambda'
import { APIGatewayEventRequestContextWithAuthorizer, APIGatewayProxyEvent } from 'aws-lambda'
import { APIGatewayRequestAuthorizerEvent } from 'aws-lambda'
import { CicadaAPIAuthorizedAPIEvent } from '../../../src/app/inboundInterfaces/lambdaTypes.js'

import { fromRawGithubUserId } from '../../../src/app/domain/types/fromRawGitHubIds.js'

export function createStubApiGatewayProxyEvent(
  overrides: Partial<APIGatewayProxyEvent> = {}
): APIGatewayProxyEvent {
  return {
    body: null,
    headers: {},
    httpMethod: '',
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: {},
    path: '',
    pathParameters: null,
    queryStringParameters: null,
    resource: '',
    stageVariables: null,
    requestContext: createStubAPIGatewayEventRequestContext(),
    ...overrides
  }
}

export function createStubApiGatewayProxyEventWithToken(
  token: string,
  overrides: Partial<APIGatewayProxyEvent> = {}
): APIGatewayProxyEvent {
  return {
    body: null,
    headers: {
      Cookie: `token=${token}`
    },
    httpMethod: '',
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: {},
    path: '',
    pathParameters: null,
    queryStringParameters: null,
    resource: '',
    stageVariables: null,
    requestContext: createStubAPIGatewayEventRequestContext(),
    ...overrides
  }
}

export function createAPIGatewayProxyWithLambdaAuthorizerEvent(
  username: string,
  rawUserId: number,
  overrides: Partial<CicadaAPIAuthorizedAPIEvent> = {}
): CicadaAPIAuthorizedAPIEvent {
  return {
    body: null,
    headers: {},
    httpMethod: '',
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: {},
    path: '',
    pathParameters: null,
    queryStringParameters: null,
    resource: '',
    stageVariables: null,
    requestContext: {
      authorizer: {
        username,
        userId: fromRawGithubUserId(rawUserId),
        principalId: '',
        integrationLatency: 0
      },
      accountId: '',
      apiId: '',
      httpMethod: '',
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        clientCert: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        principalOrgId: null,
        sourceIp: '',
        user: null,
        userAgent: null,
        userArn: null
      },
      path: '',
      protocol: '',
      requestId: '',
      requestTimeEpoch: 0,
      resourceId: '',
      resourcePath: '',
      stage: ''
    },
    ...overrides
  }
}

function createStubAPIGatewayEventRequestContext(
  overrides?: Partial<APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>>
): APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext> {
  return {
    accountId: '',
    apiId: '',
    authorizer: undefined,
    httpMethod: '',
    identity: {
      accessKey: null,
      accountId: null,
      apiKey: null,
      apiKeyId: null,
      caller: null,
      clientCert: null,
      cognitoAuthenticationProvider: null,
      cognitoAuthenticationType: null,
      cognitoIdentityId: null,
      cognitoIdentityPoolId: null,
      principalOrgId: null,
      sourceIp: '',
      user: null,
      userAgent: null,
      userArn: null
    },
    path: '',
    protocol: '',
    requestId: '',
    requestTimeEpoch: 0,
    resourceId: '',
    resourcePath: '',
    stage: '',
    ...overrides
  }
}

export function createStubAPIGatewayRequestAuthorizerEvent(
  overrides: Partial<APIGatewayRequestAuthorizerEvent> = {}
): APIGatewayRequestAuthorizerEvent {
  return {
    headers: {},
    httpMethod: '',
    methodArn: '',
    multiValueHeaders: {},
    multiValueQueryStringParameters: {},
    path: '',
    pathParameters: null,
    queryStringParameters: null,
    requestContext:
      createStubAPIGatewayEventRequestContext() as APIGatewayEventRequestContextWithAuthorizer<undefined>,
    resource: '',
    stageVariables: null,
    type: 'REQUEST',
    ...overrides
  }
}
