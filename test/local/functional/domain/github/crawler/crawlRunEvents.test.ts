import { expect, test } from 'vitest'
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
  buildGitHubWorkflowRunEventInLatest,
  buildGitHubWorkflowRunEventItemInRepoActivity,
  buildGitHubWorkflowRunItemInRepoActivity
} from '../../../../../testSupport/builders/dynamoDBItemBuilders.js'
import { processRawRunEvents } from '../../../../../../src/app/domain/github/githubWorkflowRunEvent.js'

import { RawGithubWorkflowRunEventSchema } from '../../../../../../src/app/ioTypes/RawGitHubSchemas.js'
import { fakeTableNames } from '../../../../../testSupport/fakes/fakeCicadaConfig.js'

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
  expect(appState.dynamoDB.getAllFromTable(fakeTableNames['github-repo-activity'])).toEqual([
    buildGitHubWorkflowRunEventItemInRepoActivity(testPersonalTestRepoWorkflowRun),
    buildGitHubWorkflowRunItemInRepoActivity(testPersonalTestRepoWorkflowRun)
  ])
  expect(appState.dynamoDB.getAllFromTable(fakeTableNames['github-latest-workflow-runs'])).toEqual([
    buildGitHubWorkflowRunEventInLatest(testPersonalTestRepoWorkflowRun)
  ])
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
  expect(appState.dynamoDB.getAllFromTable(fakeTableNames['github-repo-activity'])).toEqual([
    buildGitHubWorkflowRunEventItemInRepoActivity(testOrgTestRepoOneWorkflowFromJsonRunOne),
    buildGitHubWorkflowRunItemInRepoActivity(testOrgTestRepoOneWorkflowFromJsonRunOne)
  ])
  expect(appState.dynamoDB.getAllFromTable(fakeTableNames['github-latest-workflow-runs'])).toEqual([
    buildGitHubWorkflowRunEventInLatest(testOrgTestRepoOneWorkflowFromJsonRunOne)
  ])
})
