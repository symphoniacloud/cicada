import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState'
import { githubWebhookWorkflowRunProcessor } from '../../../../../../src/app/domain/github/webhookProcessor/processors/githubWebhookWorkflowRunProcessor'

import example_workflow_run_complete from '../../../../../examples/github/org/webhook/workflowRunCompleted.json'
import { testOrgTestRepoOneWorkflowRunThree } from '../../../../../examples/cicada/githubDomainObjects'

test('workflow-run-completed-webhook', async () => {
  const appState = new FakeAppState()

  await githubWebhookWorkflowRunProcessor(appState, JSON.stringify(example_workflow_run_complete))

  expect(appState.dynamoDB.puts.length).toEqual(3)
  expect(appState.dynamoDB.puts[0]).toEqual({
    ConditionExpression: 'attribute_not_exists(PK)',
    Item: {
      PK: 'ACCOUNT#162483619',
      SK: 'REPO#768206479#WORKFLOW#88647110#WORKFLOW_RUN_EVENT#UPDATED_AT#2024-03-06T19:25:42Z#RUN#8177622236#STATUS#completed',
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
      SK: 'REPO#768206479#WORKFLOW#88647110#WORKFLOW_RUN#RUN#8177622236',
      GSI1PK: 'ACCOUNT#162483619',
      GSI1SK: 'REPO#768206479#DATETIME#2024-03-06T19:25:42Z',
      _et: 'githubWorkflowRun',
      _lastUpdated: '2024-02-02T19:00:00.000Z',
      ...testOrgTestRepoOneWorkflowRunThree
    },
    TableName: 'fakeGithubRepoActivityTable'
  })
  expect(appState.dynamoDB.puts[2]).toEqual({
    ConditionExpression: 'attribute_not_exists(PK) OR #updatedAt < :newUpdatedAt',
    ExpressionAttributeNames: {
      '#updatedAt': 'updatedAt'
    },
    ExpressionAttributeValues: {
      ':newUpdatedAt': '2024-03-06T19:25:42Z'
    },
    Item: {
      GSI1PK: 'ACCOUNT#162483619',
      GSI1SK: 'DATETIME#2024-03-06T19:25:42Z',
      PK: 'ACCOUNT#162483619',
      SK: 'REPO#768206479#WORKFLOW#88647110',
      _et: 'githubLatestWorkflowRunEvent',
      _lastUpdated: '2024-02-02T19:00:00.000Z',
      ...testOrgTestRepoOneWorkflowRunThree
    },
    TableName: 'fakeGithubLatestWorkflowRunsTable'
  })

  expect(appState.eventBridgeBus.sentEvents.length).toEqual(1)
  expect(appState.eventBridgeBus.sentEvents[0]).toEqual({
    detailType: 'GithubNewWorkflowRunEvent',
    detail: JSON.stringify({
      data: {
        ownerId: 162483619,
        ownerName: 'cicada-test-org',
        ownerType: 'organization',
        repoId: 768206479,
        repoName: 'org-test-repo-one',
        repoHtmlUrl: 'https://github.com/cicada-test-org/org-test-repo-one',
        workflowId: 88647110,
        id: 8177622236,
        runNumber: 3,
        runAttempt: 1,
        event: 'workflow_dispatch',
        path: '.github/workflows/test.yml',
        displayTitle: 'Test Repo One Workflow',
        createdAt: '2024-03-06T19:25:32Z',
        updatedAt: '2024-03-06T19:25:42Z',
        runStartedAt: '2024-03-06T19:25:32Z',
        status: 'completed',
        workflowName: 'Test Repo One Workflow',
        conclusion: 'success',
        headBranch: 'main',
        htmlUrl: 'https://github.com/cicada-test-org/org-test-repo-one/actions/runs/8177622236',
        headSha: '8c3aa1cb0316ea23abeb2612457edb80868f53c8',
        actor: {
          login: 'mikebroberts',
          id: 49635,
          avatarUrl: 'https://avatars.githubusercontent.com/u/49635?v=4',
          htmlUrl: 'https://github.com/mikebroberts'
        }
      }
    })
  })
})
