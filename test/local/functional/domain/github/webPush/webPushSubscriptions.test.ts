import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState.js'
import { testTestUserPushSubscription } from '../../../../../examples/cicada/webPushDomainObjects.js'
import { handleApiMessage } from '../../../../../../src/app/lambdaFunctions/authenticatedApi/lambda.js'
import { createAPIGatewayProxyWithLambdaAuthorizerEvent } from '../../../../../testSupport/fakes/awsStubs.js'
import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2'
import {
  expectDelete,
  expectDeletesLength,
  expectPut,
  expectPutsLength
} from '../../../../../testSupport/fakes/dynamoDB/fakeDynamoDBInterfaceExpectations.js'
import {
  expectedDeleteWebPushSubscription,
  expectedPutWebPushSubscription
} from '../../../../../testSupport/fakes/tableRecordExpectedWrites.js'

test('web push test', async () => {
  const appState = new FakeAppState()

  const result = await handleApiMessage(
    appState,
    createAPIGatewayProxyWithLambdaAuthorizerEvent('cicada-test-user', 162360409, {
      path: '/apia/ping',
      httpMethod: HttpMethod.POST
    })
  )

  expect(result).toEqual({
    body: JSON.stringify({ message: 'Web Push Test OK' }),
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode: 200
  })
  expect(appState.eventBridgeBus.sentEvents.length).toEqual(1)
  expect(appState.eventBridgeBus.sentEvents[0]).toEqual({
    detail: JSON.stringify({ data: { userId: 'GHUser162360409', userName: 'cicada-test-user' } }),
    detailType: 'WebPushTest'
  })
})

test('web push subscribe', async () => {
  const appState = new FakeAppState()

  const result = await handleApiMessage(
    appState,
    createAPIGatewayProxyWithLambdaAuthorizerEvent('cicada-test-user', 162360409, {
      path: '/apia/webPushSubscribe',
      httpMethod: HttpMethod.POST,
      body: JSON.stringify({
        endpoint: 'https://web.push.apple.com/TestOne',
        keys: {
          p256dh: 'testkey1',
          auth: 'testauth1'
        }
      })
    })
  )

  expect(result).toEqual({
    body: JSON.stringify({ message: 'successfully subscribed' }),
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode: 200
  })
  expectPutsLength(appState).toEqual(1)
  expectPut(appState).toEqual(expectedPutWebPushSubscription(testTestUserPushSubscription))
})

test('web push unsubscribe', async () => {
  const appState = new FakeAppState()

  const result = await handleApiMessage(
    appState,
    createAPIGatewayProxyWithLambdaAuthorizerEvent('cicada-test-user', 162360409, {
      path: '/apia/webPushUnsubscribe',
      httpMethod: HttpMethod.POST,
      body: JSON.stringify({
        endpoint: 'https://web.push.apple.com/TestOne',
        keys: {
          p256dh: 'testkey1',
          auth: 'testauth1'
        }
      })
    })
  )

  expect(result).toEqual({
    body: JSON.stringify({ message: 'successfully unsubscribed' }),
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode: 200
  })
  expectDeletesLength(appState).toEqual(1)
  expectDelete(appState).toEqual(expectedDeleteWebPushSubscription(testTestUserPushSubscription))
})
