import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState'
import { githubWebhookWorkflowRunProcessor } from '../../../../../../src/app/domain/github/webhookProcessor/processors/githubWebhookWorkflowRunProcessor'

import example_workflow_run_complete from '../../../../../examples/github/org/webhook/workflowRunCompleted.json'
import {
  testOrgTestWorkflowOneFromJson,
  testOrgTestWorkflowOneFromJsonRun
} from '../../../../../examples/cicada/githubDomainObjects'
import {
  expectPut,
  expectPutsLength
} from '../../../../../testSupport/fakes/dynamoDB/fakeDynamoDBInterfaceExpectations'
import {
  expectedPutGithubWorkflowRun,
  expectedPutGithubWorkflowRunEvent,
  expectedPutLatestGithubWorkflowRunEvent
} from '../../../../../testSupport/fakes/tableRecordExpectedWrites'
import {
  stubGetGithubInstallation,
  stubGetWorkflow
} from '../../../../../testSupport/fakes/tableRecordReadStubs'
import { FakeGithubInstallationClient } from '../../../../../testSupport/fakes/fakeGithubInstallationClient'
import { fromRawGithubInstallationId } from '../../../../../../src/app/domain/types/GithubInstallationId'

test('workflow-run-completed-webhook', async () => {
  const appState = new FakeAppState()
  stubGetGithubInstallation(appState)
  const githubInstallationClient = new FakeGithubInstallationClient()
  appState.githubClient.fakeClientsForInstallation.addResponse(
    fromRawGithubInstallationId(48133709),
    githubInstallationClient
  )
  stubGetWorkflow(appState, testOrgTestWorkflowOneFromJson)

  await githubWebhookWorkflowRunProcessor(appState, JSON.stringify(example_workflow_run_complete))

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
