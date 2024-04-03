import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState'
import {
  testMikeRobertsUserMembershipOfOrg,
  testOrgTestRepoOneWorkflowRunThree,
  testTestUserMembershipOfOrg
} from '../../../../../examples/cicada/githubDomainObjects'
import {
  GITHUB_ACCOUNT_MEMBERSHIP,
  WEB_PUSH_SUBSCRIPTION
} from '../../../../../../src/app/domain/entityStore/entityTypes'
import { processEventBridgeWebPushEvent } from '../../../../../../src/app/domain/webPush/webPushEventBridgeEventProcessor'
import {
  testMikeRobertsPushSubscriptionThree,
  testMikeRobertsPushSubscriptionTwo,
  testTestUserPushSubscription
} from '../../../../../examples/cicada/webPushDomainObjects'
import { EVENTBRIDGE_DETAIL_TYPES } from '../../../../../../src/multipleContexts/eventBridge'

test('newWorkflowRunEvent', async () => {
  const appState = new FakeAppState()
  appState.dynamoDB.stubAllPagesQueries.addResponse(
    {
      TableName: 'fakeGithubAccountMemberships',
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': 'ACCOUNT#162483619' }
    },
    [
      {
        $metadata: {},
        Items: [
          { ...testTestUserMembershipOfOrg, _et: GITHUB_ACCOUNT_MEMBERSHIP },
          { ...testMikeRobertsUserMembershipOfOrg, _et: GITHUB_ACCOUNT_MEMBERSHIP }
        ]
      }
    ]
  )

  appState.dynamoDB.stubAllPagesQueries.addResponse(
    {
      TableName: 'fakeWebPushSubscriptions',
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': 'USER#162360409' }
    },
    [
      {
        $metadata: {},
        Items: [
          {
            _et: WEB_PUSH_SUBSCRIPTION,
            ...testTestUserPushSubscription
          }
        ]
      }
    ]
  )
  appState.dynamoDB.stubAllPagesQueries.addResponse(
    {
      TableName: 'fakeWebPushSubscriptions',
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': 'USER#49635' }
    },
    [
      {
        $metadata: {},
        Items: [
          {
            _et: WEB_PUSH_SUBSCRIPTION,
            ...testMikeRobertsPushSubscriptionTwo
          },
          {
            _et: WEB_PUSH_SUBSCRIPTION,
            ...testMikeRobertsPushSubscriptionThree
          }
        ]
      }
    ]
  )

  await processEventBridgeWebPushEvent(appState, {
    version: '0',
    id: '136bcba1-4d40-4a7b-d67d-ae2c8839624e',
    'detail-type': EVENTBRIDGE_DETAIL_TYPES.GITHUB_NEW_WORKFLOW_RUN_EVENT,
    source: 'cicada-test-org',
    account: '397589511426',
    time: '2024-03-08T22:35:25Z',
    region: 'us-east-1',
    resources: [],
    detail: {
      data: testOrgTestRepoOneWorkflowRunThree
    }
  })

  expect(
    appState.webPushWrapper.notificationsForSubscription({
      endpoint: 'https://web.push.apple.com/TestOne',
      keys: {
        auth: 'testauth1',
        p256dh: 'testkey1'
      }
    })
  ).toEqual([
    {
      title: '✅ Test Repo One Workflow',
      body: 'Workflow Test Repo One Workflow in Repo org-test-repo-one succeeded',
      data: {
        url: 'https://github.com/cicada-test-org/org-test-repo-one/actions/runs/8177622236'
      }
    }
  ])
  expect(
    appState.webPushWrapper.notificationsForSubscription({
      endpoint: 'https://web.push.apple.com/TestTwo',
      keys: {
        auth: 'testauth2',
        p256dh: 'testkey2'
      }
    })
  ).toEqual([
    {
      title: '✅ Test Repo One Workflow',
      body: 'Workflow Test Repo One Workflow in Repo org-test-repo-one succeeded',
      data: {
        url: 'https://github.com/cicada-test-org/org-test-repo-one/actions/runs/8177622236'
      }
    }
  ])
  expect(
    appState.webPushWrapper.notificationsForSubscription({
      endpoint: 'https://web.push.apple.com/TestThree',
      keys: {
        auth: 'testauth3',
        p256dh: 'testkey3'
      }
    })
  ).toEqual([
    {
      title: '✅ Test Repo One Workflow',
      body: 'Workflow Test Repo One Workflow in Repo org-test-repo-one succeeded',
      data: {
        url: 'https://github.com/cicada-test-org/org-test-repo-one/actions/runs/8177622236'
      }
    }
  ])
})

test('newPushTest', async () => {
  const appState = new FakeAppState()
  appState.dynamoDB.stubAllPagesQueries.addResponse(
    {
      TableName: 'fakeGithubAccountMemberships',
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': 'ACCOUNT#162483619' }
    },
    [
      {
        $metadata: {},
        Items: [{ ...testTestUserMembershipOfOrg, _et: GITHUB_ACCOUNT_MEMBERSHIP }]
      }
    ]
  )

  appState.dynamoDB.stubAllPagesQueries.addResponse(
    {
      TableName: 'fakeWebPushSubscriptions',
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': 'USER#162360409' }
    },
    [
      {
        $metadata: {},
        Items: [
          {
            _et: WEB_PUSH_SUBSCRIPTION,
            ...testTestUserPushSubscription
          }
        ]
      }
    ]
  )

  await processEventBridgeWebPushEvent(appState, {
    version: '0',
    id: '136bcba1-4d40-4a7b-d67d-ae2c8839624e',
    'detail-type': EVENTBRIDGE_DETAIL_TYPES.WEB_PUSH_TEST,
    source: 'cicada-test-org',
    account: '397589511426',
    time: '2024-03-08T22:35:25Z',
    region: 'us-east-1',
    resources: [],
    detail: {
      data: {
        userId: 162360409
      }
    }
  })

  expect(
    appState.webPushWrapper.notificationsForSubscription({
      endpoint: 'https://web.push.apple.com/TestOne',
      keys: {
        auth: 'testauth1',
        p256dh: 'testkey1'
      }
    })
  ).toEqual([
    {
      body: 'This is a test for push notifications from Cicada',
      title: '✅ Web Push Test'
    }
  ])
})
