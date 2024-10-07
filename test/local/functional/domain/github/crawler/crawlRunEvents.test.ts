import { test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState'
import {
  personalTestRepoWorkflow,
  testOrgTestRepoOneWorkflowRunOne,
  testOrgTestWorkflowOne,
  testPersonalTestRepoWorkflowRun
} from '../../../../../examples/cicada/githubDomainObjects'

import example_personal_workflow_run from '../../../../../examples/github/personal-account/api/workflowRunEvent.json'
import example_org_workflow_run from '../../../../../examples/github/org/api/workflowRunEvent.json'
import {
  expectPut,
  expectPutsLength
} from '../../../../../testSupport/fakes/dynamoDB/fakeDynamoDBInterfaceExpectations'
import {
  expectedPutGithubWorkflowRun,
  expectedPutGithubWorkflowRunEvent,
  expectedPutLatestGithubWorkflowRunEvent
} from '../../../../../testSupport/fakes/tableRecordExpectedWrites'
import { processRawRunEventsForWorkflow } from '../../../../../../src/app/domain/github/githubWorkflowRunEvent'

test('repo-crawler-for-personal-account-installation', async () => {
  // A
  const appState = new FakeAppState()

  // A
  await processRawRunEventsForWorkflow(
    appState,
    personalTestRepoWorkflow,
    [example_personal_workflow_run],
    false
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

  // A
  await processRawRunEventsForWorkflow(appState, testOrgTestWorkflowOne, [example_org_workflow_run], false)

  // A
  expectPutsLength(appState).toEqual(3)
  expectPut(appState, 0).toEqual(expectedPutGithubWorkflowRunEvent(testOrgTestRepoOneWorkflowRunOne))
  expectPut(appState, 1).toEqual(expectedPutGithubWorkflowRun(testOrgTestRepoOneWorkflowRunOne))
  expectPut(appState, 2).toEqual(expectedPutLatestGithubWorkflowRunEvent(testOrgTestRepoOneWorkflowRunOne))
})
