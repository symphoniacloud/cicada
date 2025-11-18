import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState.js'
import { githubWebhookWorkflowRunProcessor } from '../../../../../../src/app/domain/github/webhookProcessor/processors/githubWebhookWorkflowRunProcessor.js'

import example_workflow_run_complete from '../../../../../examples/github/org/webhook/workflowRunCompleted.json' with { type: 'json' }
import {
  cicadaTestOrgInstallation,
  testOrgTestWorkflowOneFromJson,
  testOrgTestWorkflowOneFromJsonRun,
  testOrgTestWorkflowOneFromWebhook
} from '../../../../../examples/cicada/githubDomainObjects.js'
import {
  buildGitHubInstallationItem,
  buildGitHubWorkflowItem,
  buildGitHubWorkflowRunEventInLatest,
  buildGitHubWorkflowRunEventItemInRepoActivity,
  buildGitHubWorkflowRunItemInRepoActivity
} from '../../../../../testSupport/builders/dynamoDBItemBuilders.js'
import { FakeGithubInstallationClient } from '../../../../../testSupport/fakes/fakeGithubInstallationClient.js'

import { fromRawGithubInstallationId } from '../../../../../../src/app/domain/github/mappings/toFromRawGitHubIds.js'

test('workflow-run-completed-webhook', async () => {
  const appState = new FakeAppState()
  appState.putToTable('github-installations', buildGitHubInstallationItem(cicadaTestOrgInstallation))
  appState.putToTable('github-workflows', buildGitHubWorkflowItem(testOrgTestWorkflowOneFromJson))
  const githubInstallationClient = new FakeGithubInstallationClient()
  appState.githubClient.fakeClientsForInstallation.addResponse(
    fromRawGithubInstallationId(48133709),
    githubInstallationClient
  )

  await githubWebhookWorkflowRunProcessor(appState, JSON.stringify(example_workflow_run_complete))

  expect(appState.getAllFromTable('github-repo-activity')).toEqual([
    buildGitHubWorkflowRunEventItemInRepoActivity(testOrgTestWorkflowOneFromJsonRun),
    buildGitHubWorkflowRunItemInRepoActivity(testOrgTestWorkflowOneFromJsonRun)
  ])
  expect(appState.getAllFromTable('github-latest-workflow-runs')).toEqual([
    buildGitHubWorkflowRunEventInLatest(testOrgTestWorkflowOneFromJsonRun)
  ])

  expect(appState.eventBridgeBus.sentEvents.length).toEqual(1)
  expect(appState.eventBridgeBus.sentEvents[0].detailType).toEqual('GithubNewWorkflowRunEvent')
  expect(JSON.parse(appState.eventBridgeBus.sentEvents[0].detail)).toEqual({
    data: testOrgTestWorkflowOneFromJsonRun
  })
})

test('workflow-run-completed-webhook-for-new-workflow', async () => {
  const appState = new FakeAppState()
  appState.putToTable('github-installations', buildGitHubInstallationItem(cicadaTestOrgInstallation))
  // NOTE: Not pre-populating the workflow - it should be created from the webhook
  const githubInstallationClient = new FakeGithubInstallationClient()
  githubInstallationClient.stubWorkflowsForRepo.addResponse(
    { owner: 'cicada-test-org', repo: 'org-test-repo-one' },
    [example_workflow_run_complete.workflow]
  )
  appState.githubClient.fakeClientsForInstallation.addResponse(
    fromRawGithubInstallationId(48133709),
    githubInstallationClient
  )

  await githubWebhookWorkflowRunProcessor(appState, JSON.stringify(example_workflow_run_complete))

  // Verify the workflow was created
  expect(appState.getAllFromTable('github-workflows')).toEqual([
    buildGitHubWorkflowItem(testOrgTestWorkflowOneFromWebhook)
  ])

  // Verify the rest of the processing works correctly
  expect(appState.getAllFromTable('github-repo-activity')).toEqual([
    buildGitHubWorkflowRunEventItemInRepoActivity(testOrgTestWorkflowOneFromJsonRun),
    buildGitHubWorkflowRunItemInRepoActivity(testOrgTestWorkflowOneFromJsonRun)
  ])
  expect(appState.getAllFromTable('github-latest-workflow-runs')).toEqual([
    buildGitHubWorkflowRunEventInLatest(testOrgTestWorkflowOneFromJsonRun)
  ])

  expect(appState.eventBridgeBus.sentEvents.length).toEqual(1)
  expect(appState.eventBridgeBus.sentEvents[0].detailType).toEqual('GithubNewWorkflowRunEvent')
  expect(JSON.parse(appState.eventBridgeBus.sentEvents[0].detail)).toEqual({
    data: testOrgTestWorkflowOneFromJsonRun
  })
})
