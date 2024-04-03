import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState'
import { testTestUserPushSubscription } from '../../../../../examples/cicada/webPushDomainObjects'
import { handleApiMessage } from '../../../../../../src/app/lambdaFunctions/authenticatedApi/lambda'
import { createAPIGatewayProxyWithLambdaAuthorizerEvent } from '../../../../../testSupport/fakes/awsStubs'
import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2'

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
    detail: JSON.stringify({ data: { userId: 162360409 } }),
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
  expect(appState.dynamoDB.puts.length).toEqual(1)
  expect(appState.dynamoDB.puts[0]).toEqual({
    Item: {
      PK: 'USER#162360409',
      SK: 'ENDPOINT#https://web.push.apple.com/TestOne',
      _et: 'webPushSubscription',
      _lastUpdated: '2024-02-02T19:00:00.000Z',
      ...testTestUserPushSubscription
    },
    TableName: 'fakeWebPushSubscriptions'
  })
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
  expect(appState.dynamoDB.deletes.length).toEqual(1)
  expect(appState.dynamoDB.deletes[0]).toEqual({
    Key: {
      PK: 'USER#162360409',
      SK: 'ENDPOINT#https://web.push.apple.com/TestOne'
    },
    TableName: 'fakeWebPushSubscriptions'
  })
})
