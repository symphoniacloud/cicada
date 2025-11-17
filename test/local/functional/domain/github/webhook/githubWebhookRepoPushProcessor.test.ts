import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState.js'

import example_push from '../../../../../examples/github/org/webhook/push.json' with { type: 'json' }
import example_push_no_head from '../../../../../examples/github/org/webhook/pushNoHead.json' with { type: 'json' }
import { githubWebhookRepoPushProcessor } from '../../../../../../src/app/domain/github/webhookProcessor/processors/githubWebhookRepoPushProcessor.js'
import { testOrgTestRepoOnePushFC94 } from '../../../../../examples/cicada/githubDomainObjects.js'
import {
  buildGitHubPushItemInLatestPushPerRef,
  buildGitHubPushItemInRepoActivity
} from '../../../../../testSupport/builders/dynamoDBItemBuilders.js'
import { fakeTableNames } from '../../../../../testSupport/fakes/fakeCicadaConfig.js'

test('push-webhook', async () => {
  const appState = new FakeAppState()

  await githubWebhookRepoPushProcessor(appState, JSON.stringify(example_push))

  expect(appState.dynamoDB.getAllFromTable(fakeTableNames['github-repo-activity'])).toEqual([
    buildGitHubPushItemInRepoActivity(testOrgTestRepoOnePushFC94)
  ])
  expect(appState.dynamoDB.getAllFromTable(fakeTableNames['github-latest-pushes-per-ref'])).toEqual([
    buildGitHubPushItemInLatestPushPerRef(testOrgTestRepoOnePushFC94)
  ])

  expect(appState.eventBridgeBus.sentEvents.length).toEqual(1)
  expect(appState.eventBridgeBus.sentEvents[0].detailType).toEqual('GithubNewPush')
  expect(JSON.parse(appState.eventBridgeBus.sentEvents[0].detail)).toEqual({
    data: testOrgTestRepoOnePushFC94
  })
})

// Implicitly tests for not throwing an error
test('push-no-head-webhook', async () => {
  const appState = new FakeAppState()

  await githubWebhookRepoPushProcessor(appState, JSON.stringify(example_push_no_head))

  expect(appState.dynamoDB.getAllFromTable(fakeTableNames['github-repo-activity'])).toEqual([])
  expect(appState.dynamoDB.getAllFromTable(fakeTableNames['github-latest-pushes-per-ref'])).toEqual([])
  expect(appState.eventBridgeBus.sentEvents.length).toEqual(0)
})
