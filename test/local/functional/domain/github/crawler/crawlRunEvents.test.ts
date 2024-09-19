import { test } from 'vitest'
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
import {
  expectPut,
  expectPutsLength
} from '../../../../../testSupport/fakes/dynamoDB/fakeDynamoDBInterfaceExpectations'
import {
  expectedPutGithubWorkflowRun,
  expectedPutGithubWorkflowRunEvent,
  expectedPutLatestGithubWorkflowRunEvent
} from '../../../../../testSupport/fakes/tableRecordExpectedWrites'

test('repo-crawler-for-personal-account-installation', async () => {
  // A
  const appState = new FakeAppState()
  const githubInstallationClient = new FakeGithubInstallationClient()
  githubInstallationClient.stubWorkflowRunsForRepo.addResponse(
    {
      owner: 'cicada-test-user',
      repo: 'personal-test-repo',
      created: '>2024-01-23T19:00:00.000Z'
    },
    [example_personal_workflow_run]
  )

  // A
  await crawlWorkflowRunEvents(
    appState,
    testPersonalInstallation,
    testPersonalTestRepo,
    10,
    githubInstallationClient
  )

  // A
  expectPutsLength(appState).toEqual(3)
  expectPut(appState, 0).toEqual(expectedPutGithubWorkflowRunEvent(testPersonalTestRepoWorkflowRun))
  expectPut(appState, 1).toEqual(expectedPutGithubWorkflowRun(testPersonalTestRepoWorkflowRun))
  expectPut(appState, 2).toEqual(expectedPutLatestGithubWorkflowRunEvent(testPersonalTestRepoWorkflowRun))
})

test('repo-crawler-for-org-installation', async () => {
  // A
  const appState = new FakeAppState()
  const githubInstallationClient = new FakeGithubInstallationClient()
  githubInstallationClient.stubWorkflowRunsForRepo.addResponse(
    {
      owner: 'cicada-test-org',
      repo: 'org-test-repo-one',
      created: '>2024-01-23T19:00:00.000Z'
    },
    [example_org_workflow_run]
  )

  // A
  await crawlWorkflowRunEvents(
    appState,
    testOrgInstallation,
    testOrgTestRepoOne,
    10,
    githubInstallationClient
  )

  // A
  expectPutsLength(appState).toEqual(3)
  expectPut(appState, 0).toEqual(expectedPutGithubWorkflowRunEvent(testOrgTestRepoOneWorkflowRunOne))
  expectPut(appState, 1).toEqual(expectedPutGithubWorkflowRun(testOrgTestRepoOneWorkflowRunOne))
  expectPut(appState, 2).toEqual(expectedPutLatestGithubWorkflowRunEvent(testOrgTestRepoOneWorkflowRunOne))
})
