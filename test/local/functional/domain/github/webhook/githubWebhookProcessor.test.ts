import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState.js'
import example_workflow_run from '../../../../../examples/github/org/webhook/workflowRunCompleted.json' with { type: 'json' }
import {
  testOrgTestWorkflowOneFromJson,
  testOrgTestWorkflowOneFromJsonRun
} from '../../../../../examples/cicada/githubDomainObjects.js'
import {
  createSignatureHeader,
  processWebhookFromS3Event
} from '../../../../../../src/app/domain/github/webhookProcessor/githubWebhookProcessor.js'
import {
  expectPut,
  expectPutsLength
} from '../../../../../testSupport/fakes/dynamoDB/fakeDynamoDBInterfaceExpectations.js'
import {
  expectedPutGithubWorkflowRun,
  expectedPutGithubWorkflowRunEvent,
  expectedPutLatestGithubWorkflowRunEvent
} from '../../../../../testSupport/fakes/tableRecordExpectedWrites.js'
import {
  stubGetGithubInstallation,
  stubGetWorkflow
} from '../../../../../testSupport/fakes/tableRecordReadStubs.js'
import { FakeGithubInstallationClient } from '../../../../../testSupport/fakes/fakeGithubInstallationClient.js'
import { fromRawGithubInstallationId } from '../../../../../../src/app/domain/types/GithubInstallationId.js'

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
  stubGetGithubInstallation(appState)
  const githubInstallationClient = new FakeGithubInstallationClient()
  appState.githubClient.fakeClientsForInstallation.addResponse(
    fromRawGithubInstallationId(48133709),
    githubInstallationClient
  )
  stubGetWorkflow(appState, testOrgTestWorkflowOneFromJson)

  // Act
  await processWebhookFromS3Event(appState, {
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
  expectPutsLength(appState).toEqual(3)
  expectPut(appState, 0).toEqual(expectedPutGithubWorkflowRunEvent(testOrgTestWorkflowOneFromJsonRun))
  expectPut(appState, 1).toEqual(expectedPutGithubWorkflowRun(testOrgTestWorkflowOneFromJsonRun))
  expectPut(appState, 2).toEqual(expectedPutLatestGithubWorkflowRunEvent(testOrgTestWorkflowOneFromJsonRun))

  expect(appState.eventBridgeBus.sentEvents.length).toEqual(1)
  expect(appState.eventBridgeBus.sentEvents[0].detailType).toEqual('GithubNewWorkflowRunEvent')
  expect(JSON.parse(appState.eventBridgeBus.sentEvents[0].detail)).toEqual({
    data: testOrgTestWorkflowOneFromJsonRun
  })
})
