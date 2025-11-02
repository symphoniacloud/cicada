import { test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState.js'
import {
  personalTestRepoWorkflow,
  testOrgTestRepoOneWorkflowFromJsonRunOne,
  testOrgTestWorkflowOneFromJsonSummary,
  testPersonalTestRepoWorkflowRun
} from '../../../../../examples/cicada/githubDomainObjects.js'

import example_personal_workflow_run from '../../../../../examples/github/personal-account/api/workflowRunEvent.json' with { type: 'json' }
import example_org_workflow_run from '../../../../../examples/github/org/api/workflowRunEvent.json' with { type: 'json' }
import {
  expectPut,
  expectPutsLength
} from '../../../../../testSupport/fakes/dynamoDB/fakeDynamoDBInterfaceExpectations.js'
import {
  expectedPutGithubWorkflowRun,
  expectedPutGithubWorkflowRunEvent,
  expectedPutLatestGithubWorkflowRunEvent
} from '../../../../../testSupport/fakes/tableRecordExpectedWrites.js'
import { processRawRunEvents } from '../../../../../../src/app/domain/github/githubWorkflowRunEvent.js'
import { RawGithubWorkflowRunEventSchema } from '../../../../../../src/app/domain/types/rawGithub/RawGithubWorkflowRunEvent.js'

test('repo-crawler-for-personal-account-installation', async () => {
  // A
  const appState = new FakeAppState()

  // A
  await processRawRunEvents(
    appState,
    [personalTestRepoWorkflow],
    [RawGithubWorkflowRunEventSchema.parse(example_personal_workflow_run)],
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
  await processRawRunEvents(
    appState,
    [testOrgTestWorkflowOneFromJsonSummary],
    [RawGithubWorkflowRunEventSchema.parse(example_org_workflow_run)],
    false
  )

  // A
  expectPutsLength(appState).toEqual(3)
  expectPut(appState, 0).toEqual(expectedPutGithubWorkflowRunEvent(testOrgTestRepoOneWorkflowFromJsonRunOne))
  expectPut(appState, 1).toEqual(expectedPutGithubWorkflowRun(testOrgTestRepoOneWorkflowFromJsonRunOne))
  expectPut(appState, 2).toEqual(
    expectedPutLatestGithubWorkflowRunEvent(testOrgTestRepoOneWorkflowFromJsonRunOne)
  )
})
