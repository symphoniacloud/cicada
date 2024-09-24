import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState'
import example_workflow_run from '../../../../../examples/github/org/webhook/workflowRunCompleted.json'
import { testOrgTestRepoOneWorkflowRunThree } from '../../../../../examples/cicada/githubDomainObjects'
import {
  createSignatureHeader,
  processWebhookFromS3Event
} from '../../../../../../src/app/domain/github/webhookProcessor/githubWebhookProcessor'
import {
  expectPut,
  expectPutsLength
} from '../../../../../testSupport/fakes/dynamoDB/fakeDynamoDBInterfaceExpectations'
import {
  expectedPutGithubWorkflowRun,
  expectedPutGithubWorkflowRunEvent,
  expectedPutLatestGithubWorkflowRunEvent
} from '../../../../../testSupport/fakes/tableRecordExpectedWrites'

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
  expectPut(appState, 0).toEqual(expectedPutGithubWorkflowRunEvent(testOrgTestRepoOneWorkflowRunThree))
  expectPut(appState, 1).toEqual(expectedPutGithubWorkflowRun(testOrgTestRepoOneWorkflowRunThree))
  expectPut(appState, 2).toEqual(expectedPutLatestGithubWorkflowRunEvent(testOrgTestRepoOneWorkflowRunThree))

  expect(appState.eventBridgeBus.sentEvents.length).toEqual(1)
  expect(appState.eventBridgeBus.sentEvents[0].detailType).toEqual('GithubNewWorkflowRunEvent')
  expect(JSON.parse(appState.eventBridgeBus.sentEvents[0].detail)).toEqual({
    data: testOrgTestRepoOneWorkflowRunThree
  })
})