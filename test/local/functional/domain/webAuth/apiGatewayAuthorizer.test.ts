import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../testSupport/fakes/fakeAppState'
import { createStubAPIGatewayRequestAuthorizerEvent } from '../../../../testSupport/fakes/awsStubs'
import { GITHUB_ACCOUNT_MEMBERSHIP, GITHUB_USER } from '../../../../../src/app/domain/entityStore/entityTypes'
import { attemptToAuthorize } from '../../../../../src/app/domain/webAuth/apiGatewayAuthorizer'
import { testTestUserMembershipOfOrg } from '../../../../examples/cicada/githubDomainObjects'

test('failed-auth-no-token', async () => {
  const appState = new FakeAppState()
  const response = await attemptToAuthorize(
    appState,
    createStubAPIGatewayRequestAuthorizerEvent({
      methodArn: 'arn:aws:execute-api:us-east-1:123456789012:1234567890/prod/GET/apia/hello'
    })
  )

  expect(response).toEqual({
    principalId: 'restAuthorizer',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Deny',
          Resource: 'arn:aws:execute-api:us-east-1:123456789012:1234567890/*'
        }
      ]
    },
    // Means that the user details are available to target lambda function
    context: {}
  })
})

test('successful-auth', async () => {
  const appState = new FakeAppState()
  appState.githubClient.stubGithubUsers.addResponse('token-1234', {
    login: 'testLogin',
    id: 162360409,
    avatar_url: '',
    html_url: '',
    type: '',
    url: ''
  })
  appState.dynamoDB.stubGets.addResponse(
    {
      TableName: 'fakeGithubUsersTable',
      Key: {
        PK: 'USER#162360409'
      }
    },
    {
      Item: {
        PK: 'USER#162360409',
        _et: GITHUB_USER,
        login: 'fakeUserLogin',
        id: 162360409,
        avatarUrl: '',
        htmlUrl: '',
        url: ''
      },
      $metadata: {}
    }
  )
  appState.dynamoDB.stubAllPagesQueries.addResponse(
    {
      TableName: 'fakeGithubAccountMemberships',
      KeyConditionExpression: 'GSI1PK = :pk',
      IndexName: 'GSI1',
      ExpressionAttributeValues: { ':pk': 'USER#162360409' }
    },
    [
      {
        $metadata: {},
        Items: [{ ...testTestUserMembershipOfOrg, _et: GITHUB_ACCOUNT_MEMBERSHIP }]
      }
    ]
  )

  const response = await attemptToAuthorize(
    appState,
    createStubAPIGatewayRequestAuthorizerEvent({
      methodArn: 'arn:aws:execute-api:us-east-1:123456789012:1234567890/prod/GET/apia/hello',
      multiValueHeaders: {
        Cookie: ['token=token-1234']
      }
    })
  )

  expect(response).toEqual({
    principalId: 'restAuthorizer',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: 'arn:aws:execute-api:us-east-1:123456789012:1234567890/*'
        }
      ]
    },
    // Means that the user details are available to target lambda function
    context: {
      username: 'fakeUserLogin',
      userId: '162360409'
    }
  })
})
