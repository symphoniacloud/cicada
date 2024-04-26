import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState'
import { FakeGithubInstallationClient } from '../../../../../testSupport/fakes/fakeGithubInstallationClient'
import {
  testOrgInstallation,
  testOrgTestRepoOne,
  testOrgTestRepoOneWorkflowRunOne,
  testPersonalInstallation,
  testPersonalTestRepo,
  testPersonalTestRepoWorkflowRun
} from '../../../../../examples/cicada/githubDomainObjects'

import example_personal_workflow_run from '../../../../../examples/github/personal-account/api/workflowRunEvent.json'
import example_org_workflow_run from '../../../../../examples/github/org/api/workflowRunEvent.json'
import { crawlWorkflowRunEvents } from '../../../../../../src/app/domain/github/crawler/crawlRunEvents'

test('repo-crawler-for-personal-account-installation', async () => {
  // A
  const appState = new FakeAppState()
  const githubInstallationClient = new FakeGithubInstallationClient()
  appState.githubClient.fakeClientsForInstallation.addResponse(48093071, githubInstallationClient)
  githubInstallationClient.stubWorkflowRunsForRepo.addResponse(
    {
      owner: 'cicada-test-user',
      repo: 'personal-test-repo',
      created: '>2024-01-23T19:00:00.000Z'
    },
    [example_personal_workflow_run]
  )

  // A
  await crawlWorkflowRunEvents(appState, testPersonalInstallation, testPersonalTestRepo, 10)

  // A
  expect(appState.dynamoDB.puts.length).toEqual(2)
  expect(appState.dynamoDB.puts[0]).toEqual({
    ConditionExpression: 'attribute_not_exists(PK)',
    Item: {
      PK: 'ACCOUNT#162360409',
      SK: 'REPO#767679529#WORKFLOW#88508779#WORKFLOW_RUN_EVENT#UPDATED_AT#2024-03-05T18:01:40Z#RUN#8160866530#STATUS#completed',
      GSI1PK: 'ACCOUNT#162360409',
      GSI1SK: 'REPO#767679529#DATETIME#2024-03-05T18:01:40Z',
      _et: 'githubWorkflowRunEvent',
      _lastUpdated: '2024-02-02T19:00:00.000Z',
      ...testPersonalTestRepoWorkflowRun
    },
    TableName: 'fakeGithubRepoActivityTable'
  })
  expect(appState.dynamoDB.puts[1]).toEqual({
    ConditionExpression: 'attribute_not_exists(PK) OR #updatedAt < :newUpdatedAt',
    ExpressionAttributeNames: {
      '#updatedAt': 'updatedAt'
    },
    ExpressionAttributeValues: {
      ':newUpdatedAt': '2024-03-05T18:01:40Z'
    },
    Item: {
      PK: 'ACCOUNT#162360409',
      SK: 'REPO#767679529#WORKFLOW#88508779',
      GSI1PK: 'ACCOUNT#162360409',
      GSI1SK: 'DATETIME#2024-03-05T18:01:40Z',
      _et: 'githubLatestWorkflowRunEvent',
      _lastUpdated: '2024-02-02T19:00:00.000Z',
      ...testPersonalTestRepoWorkflowRun
    },
    TableName: 'fakeGithubLatestWorkflowRunsTable'
  })
})

test('repo-crawler-for-org-installation', async () => {
  // A
  const appState = new FakeAppState()
  const githubInstallationClient = new FakeGithubInstallationClient()
  appState.githubClient.fakeClientsForInstallation.addResponse(48133709, githubInstallationClient)
  githubInstallationClient.stubWorkflowRunsForRepo.addResponse(
    {
      owner: 'cicada-test-org',
      repo: 'org-test-repo-one',
      created: '>2024-01-23T19:00:00.000Z'
    },
    [example_org_workflow_run]
  )

  // A
  await crawlWorkflowRunEvents(appState, testOrgInstallation, testOrgTestRepoOne, 10)

  // A
  expect(appState.dynamoDB.puts.length).toEqual(2)
  expect(appState.dynamoDB.puts[0]).toEqual({
    ConditionExpression: 'attribute_not_exists(PK)',
    Item: {
      PK: 'ACCOUNT#162483619',
      SK: 'REPO#768206479#WORKFLOW#88647110#WORKFLOW_RUN_EVENT#UPDATED_AT#2024-03-06T17:02:54Z#RUN#8175883775#STATUS#completed',
      GSI1PK: 'ACCOUNT#162483619',
      GSI1SK: 'REPO#768206479#DATETIME#2024-03-06T17:02:54Z',
      _et: 'githubWorkflowRunEvent',
      _lastUpdated: '2024-02-02T19:00:00.000Z',
      ...testOrgTestRepoOneWorkflowRunOne
    },
    TableName: 'fakeGithubRepoActivityTable'
  })
  expect(appState.dynamoDB.puts[1]).toEqual({
    ConditionExpression: 'attribute_not_exists(PK) OR #updatedAt < :newUpdatedAt',
    ExpressionAttributeNames: {
      '#updatedAt': 'updatedAt'
    },
    ExpressionAttributeValues: {
      ':newUpdatedAt': '2024-03-06T17:02:54Z'
    },
    Item: {
      PK: 'ACCOUNT#162483619',
      SK: 'REPO#768206479#WORKFLOW#88647110',
      GSI1PK: 'ACCOUNT#162483619',
      GSI1SK: 'DATETIME#2024-03-06T17:02:54Z',
      _et: 'githubLatestWorkflowRunEvent',
      _lastUpdated: '2024-02-02T19:00:00.000Z',
      ...testOrgTestRepoOneWorkflowRunOne
    },
    TableName: 'fakeGithubLatestWorkflowRunsTable'
  })
})
