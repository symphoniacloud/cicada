import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState.js'
import { testOrgTestRepoOneWorkflowRunThree } from '../../../../../examples/cicada/githubDomainObjects.js'
import { processEventBridgeWebPushEvent } from '../../../../../../src/app/domain/webPush/webPushEventBridgeEventProcessor.js'
import {
  testMikeRobertsPushSubscriptionThree,
  testMikeRobertsPushSubscriptionTwo
} from '../../../../../examples/cicada/webPushDomainObjects.js'
import {
  stubGetGithubInstallation,
  stubQueryAccountMembershipsByAccount,
  stubQueryAccountMembershipsByUser,
  stubQueryLatestWorkflowRuns,
  stubQueryRepositories,
  stubQueryWebPushSubscription,
  stubQueryWorkflows
} from '../../../../../testSupport/fakes/tableRecordReadStubs.js'

import { fromRawGithubUserId } from '../../../../../../src/app/domain/github/mappings/toFromRawGitHubIds.js'
import {
  EVENTBRIDGE_DETAIL_TYPE_GITHUB_NEW_WORKFLOW_RUN_EVENT,
  EVENTBRIDGE_DETAIL_TYPE_WEB_PUSH_TEST
} from '../../../../../../src/multipleContexts/eventBridgeSchemas.js'

test('newWorkflowRunEvent', async () => {
  const appState = new FakeAppState()
  stubGetGithubInstallation(appState)
  stubQueryAccountMembershipsByAccount(appState)
  stubQueryAccountMembershipsByUser(appState)
  stubQueryAccountMembershipsByUser(appState, fromRawGithubUserId(49635))
  stubQueryRepositories(appState)
  stubQueryWorkflows(appState)
  stubQueryLatestWorkflowRuns(appState)
  stubQueryWebPushSubscription(appState)
  stubQueryWebPushSubscription(appState, {
    userId: fromRawGithubUserId(49635),
    subscriptions: [testMikeRobertsPushSubscriptionTwo, testMikeRobertsPushSubscriptionThree]
  })

  await processEventBridgeWebPushEvent(appState, {
    version: '0',
    id: '136bcba1-4d40-4a7b-d67d-ae2c8839624e',
    'detail-type': EVENTBRIDGE_DETAIL_TYPE_GITHUB_NEW_WORKFLOW_RUN_EVENT,
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
      title: '✅ Test Workflow',
      body: 'Workflow Test Workflow in Repo org-test-repo-one succeeded',
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
      title: '✅ Test Workflow',
      body: 'Workflow Test Workflow in Repo org-test-repo-one succeeded',
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
      title: '✅ Test Workflow',
      body: 'Workflow Test Workflow in Repo org-test-repo-one succeeded',
      data: {
        url: 'https://github.com/cicada-test-org/org-test-repo-one/actions/runs/8177622236'
      }
    }
  ])
})

test('newPushTest', async () => {
  const appState = new FakeAppState()

  stubQueryAccountMembershipsByUser(appState)
  stubQueryWebPushSubscription(appState)

  await processEventBridgeWebPushEvent(appState, {
    version: '0',
    id: '136bcba1-4d40-4a7b-d67d-ae2c8839624e',
    'detail-type': EVENTBRIDGE_DETAIL_TYPE_WEB_PUSH_TEST,
    source: 'cicada-test-org',
    account: '397589511426',
    time: '2024-03-08T22:35:25Z',
    region: 'us-east-1',
    resources: [],
    detail: {
      data: {
        userId: fromRawGithubUserId(162360409),
        userName: 'cicada-test-user'
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
      title: '✅ Web Push Test',
      data: {
        url: 'https://fake-cicada.example.com'
      }
    }
  ])
})
