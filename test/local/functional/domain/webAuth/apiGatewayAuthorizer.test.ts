import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../testSupport/fakes/fakeAppState'
import { createStubAPIGatewayRequestAuthorizerEvent } from '../../../../testSupport/fakes/awsStubs'
import { attemptToAuthorize } from '../../../../../src/app/domain/webAuth/apiGatewayAuthorizer'
import { stubSetupUserRecords } from '../../../../testSupport/fakes/fakeTableRecords'

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
  stubSetupUserRecords(appState)

  const response = await attemptToAuthorize(
    appState,
    createStubAPIGatewayRequestAuthorizerEvent({
      methodArn: 'arn:aws:execute-api:us-east-1:123456789012:1234567890/prod/GET/apia/hello',
      multiValueHeaders: {
        Cookie: ['token=validUserToken']
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
      username: 'cicada-test-user',
      userId: '162360409'
    }
  })
})
