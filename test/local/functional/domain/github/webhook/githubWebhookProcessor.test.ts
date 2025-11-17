import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState.js'
import example_workflow_run from '../../../../../examples/github/org/webhook/workflowRunCompleted.json' with { type: 'json' }
import {
  cicadaTestOrgInstallation,
  testOrgTestWorkflowOneFromJson,
  testOrgTestWorkflowOneFromJsonRun
} from '../../../../../examples/cicada/githubDomainObjects.js'
import {
  createSignatureHeader,
  processGitHubWebhookFromS3Event
} from '../../../../../../src/app/domain/github/webhookProcessor/githubWebhookProcessor.js'
import {
  buildGitHubInstallationItem,
  buildGitHubWorkflowItem,
  buildGitHubWorkflowRunEventInLatest,
  buildGitHubWorkflowRunEventItemInRepoActivity,
  buildGitHubWorkflowRunItemInRepoActivity
} from '../../../../../testSupport/fakes/itemBuilders.js'
import { FakeGithubInstallationClient } from '../../../../../testSupport/fakes/fakeGithubInstallationClient.js'

import { fromRawGithubInstallationId } from '../../../../../../src/app/domain/github/mappings/toFromRawGitHubIds.js'
import { fakeTableNames } from '../../../../../testSupport/fakes/fakeCicadaConfig.js'

test('run-event', async () => {
  // Arrange
  const appState = new FakeAppState()
  const rawBody = JSON.stringify(example_workflow_run)
  appState.s3.getObjectsAsString.addResponse(
    { bucket: 'fake-bucket', key: 'fake-key' },
    JSON.stringify({
      'X-Hub-Signature-256': createSignatureHeader(rawBody, appState.config.fakeGithubConfig.webhookSecret),
      'X-GitHub-Event': 'workflow_run',
      body: rawBody
    })
  )
  appState.dynamoDB.putToTable(
    fakeTableNames['github-installations'],
    buildGitHubInstallationItem(cicadaTestOrgInstallation)
  )
  appState.dynamoDB.putToTable(
    fakeTableNames['github-workflows'],
    buildGitHubWorkflowItem(testOrgTestWorkflowOneFromJson)
  )
  const githubInstallationClient = new FakeGithubInstallationClient()
  appState.githubClient.fakeClientsForInstallation.addResponse(
    fromRawGithubInstallationId(48133709),
    githubInstallationClient
  )

  // Act
  await processGitHubWebhookFromS3Event(appState, {
    detail: {
      bucket: {
        name: 'fake-bucket'
      },
      object: {
        key: 'fake-key'
      }
    },
    'detail-type': '',
    account: '',
    id: '',
    region: '',
    resources: [],
    source: '',
    time: '',
    version: ''
  })

  // Assert
  expect(appState.dynamoDB.getAllFromTable(fakeTableNames['github-repo-activity'])).toEqual([
    buildGitHubWorkflowRunEventItemInRepoActivity(testOrgTestWorkflowOneFromJsonRun),
    buildGitHubWorkflowRunItemInRepoActivity(testOrgTestWorkflowOneFromJsonRun)
  ])
  expect(appState.dynamoDB.getAllFromTable(fakeTableNames['github-latest-workflow-runs'])).toEqual([
    buildGitHubWorkflowRunEventInLatest(testOrgTestWorkflowOneFromJsonRun)
  ])

  expect(appState.eventBridgeBus.sentEvents.length).toEqual(1)
  expect(appState.eventBridgeBus.sentEvents[0].detailType).toEqual('GithubNewWorkflowRunEvent')
  expect(JSON.parse(appState.eventBridgeBus.sentEvents[0].detail)).toEqual({
    data: testOrgTestWorkflowOneFromJsonRun
  })
})
