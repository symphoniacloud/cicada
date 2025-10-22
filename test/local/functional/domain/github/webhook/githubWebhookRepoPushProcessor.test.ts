import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState.js'

import example_push from '../../../../../examples/github/org/webhook/push.json' with { type: 'json' }
import { githubWebhookRepoPushProcessor } from '../../../../../../src/app/domain/github/webhookProcessor/processors/githubWebhookRepoPushProcessor.js'
import { testOrgTestRepoOnePushFC94 } from '../../../../../examples/cicada/githubDomainObjects.js'
import {
  expectPut,
  expectPutsLength
} from '../../../../../testSupport/fakes/dynamoDB/fakeDynamoDBInterfaceExpectations.js'
import {
  expectedPutGithubPush,
  expectedPutLatestGithubPush
} from '../../../../../testSupport/fakes/tableRecordExpectedWrites.js'

test('push-webhook', async () => {
  const appState = new FakeAppState()

  await githubWebhookRepoPushProcessor(appState, JSON.stringify(example_push))

  expectPutsLength(appState).toEqual(2)
  expectPut(appState, 0).toEqual(expectedPutGithubPush(testOrgTestRepoOnePushFC94))
  expectPut(appState, 1).toEqual(expectedPutLatestGithubPush(testOrgTestRepoOnePushFC94))

  expect(appState.eventBridgeBus.sentEvents.length).toEqual(1)
  expect(appState.eventBridgeBus.sentEvents[0].detailType).toEqual('GithubNewPush')
  expect(JSON.parse(appState.eventBridgeBus.sentEvents[0].detail)).toEqual({
    data: testOrgTestRepoOnePushFC94
  })
})
