import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState'
import example_workflow_run from '../../../../../examples/github/org/webhook/workflowRunCompleted.json'
import { testOrgTestRepoOneWorkflowRunThree } from '../../../../../examples/cicada/githubDomainObjects'
import {
  createSignatureHeader,
  processWebhookFromS3Event
} from '../../../../../../src/app/domain/github/webhookProcessor/githubWebhookProcessor'

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
  expect(appState.dynamoDB.puts.length).toEqual(2)
  expect(appState.dynamoDB.puts[0]).toEqual({
    ConditionExpression: 'attribute_not_exists(PK)',
    Item: {
      PK: 'ACCOUNT#162483619',
      SK: 'REPO#768206479#WORKFLOW_ID#88647110#RUN_ID#8177622236#UPDATED_AT#2024-03-06T19:25:42Z#STATUS#completed',
      GSI1PK: 'ACCOUNT#162483619',
      GSI1SK: 'REPO#768206479#DATETIME#2024-03-06T19:25:42Z',
      _et: 'githubWorkflowRunEvent',
      _lastUpdated: '2024-02-02T19:00:00.000Z',
      ...testOrgTestRepoOneWorkflowRunThree
    },
    TableName: 'fakeGithubRepoActivityTable'
  })
  expect(appState.dynamoDB.puts[1]).toEqual({
    ConditionExpression: 'attribute_not_exists(PK) OR #updatedAt < :newUpdatedAt',
    ExpressionAttributeNames: {
      '#updatedAt': 'updatedAt'
    },
    ExpressionAttributeValues: {
      ':newUpdatedAt': '2024-03-06T19:25:42Z'
    },
    Item: {
      PK: 'ACCOUNT#162483619',
      SK: 'REPO#768206479#WORKFLOW#88647110',
      GSI1PK: 'ACCOUNT#162483619',
      GSI1SK: 'DATETIME#2024-03-06T19:25:42Z',
      _et: 'githubLatestWorkflowRunEvent',
      _lastUpdated: '2024-02-02T19:00:00.000Z',
      ...testOrgTestRepoOneWorkflowRunThree
    },
    TableName: 'fakeGithubLatestWorkflowRunsTable'
  })

  expect(appState.eventBridgeBus.sentEvents.length).toEqual(1)
  expect(appState.eventBridgeBus.sentEvents[0]).toEqual({
    detailType: 'newWorkflowRunEvent',
    detail: `{"ownerId":162483619,"ownerName":"cicada-test-org","ownerType":"organization","repoId":768206479,"repoName":"org-test-repo-one","workflowId":88647110,"id":8177622236,"runNumber":3,"displayTitle":"Test Repo One Workflow","createdAt":"2024-03-06T19:25:32Z","updatedAt":"2024-03-06T19:25:42Z","status":"completed","workflowName":"Test Repo One Workflow","conclusion":"success","headBranch":"main","htmlUrl":"https://github.com/cicada-test-org/org-test-repo-one/actions/runs/8177622236","actor":{"login":"mikebroberts"}}`
  })
})
