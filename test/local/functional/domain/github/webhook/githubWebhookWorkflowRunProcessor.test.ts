import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState.js'
import { githubWebhookWorkflowRunProcessor } from '../../../../../../src/app/domain/github/webhookProcessor/processors/githubWebhookWorkflowRunProcessor.js'

import example_workflow_run_complete from '../../../../../examples/github/org/webhook/workflowRunCompleted.json' with { type: 'json' }
import {
  cicadaTestOrgInstallation,
  testOrgTestWorkflowOneFromJson,
  testOrgTestWorkflowOneFromJsonRun
} from '../../../../../examples/cicada/githubDomainObjects.js'
import {
  buildGitHubInstallationItem,
  buildGitHubWorkflowItem,
  buildGitHubWorkflowRunEventInLatest,
  buildGitHubWorkflowRunEventItemInRepoActivity,
  buildGitHubWorkflowRunItemInRepoActivity
} from '../../../../../testSupport/fakes/itemBuilders.js'
import { FakeGithubInstallationClient } from '../../../../../testSupport/fakes/fakeGithubInstallationClient.js'

import { fromRawGithubInstallationId } from '../../../../../../src/app/domain/github/mappings/toFromRawGitHubIds.js'
import { fakeTableNames } from '../../../../../testSupport/fakes/fakeCicadaConfig.js'

test('workflow-run-completed-webhook', async () => {
  const appState = new FakeAppState()
  appState.dynamoDB.putToTable(
    fakeTableNames['github-installations'],
    buildGitHubInstallationItem(cicadaTestOrgInstallation)
  )
  appState.dynamoDB.putToTable(
    fakeTableNames['github-workflows'],
    buildGitHubWorkflowItem(testOrgTestWorkflowOneFromJson)
  )
  const githubInstallationClient = new FakeGithubInstallationClient()
  appState.githubClient.fakeClientsForInstallation.addResponse(
    fromRawGithubInstallationId(48133709),
    githubInstallationClient
  )

  await githubWebhookWorkflowRunProcessor(appState, JSON.stringify(example_workflow_run_complete))

  expect(appState.dynamoDB.getAllFromTable(fakeTableNames['github-repo-activity'])).toEqual([
    buildGitHubWorkflowRunEventItemInRepoActivity(testOrgTestWorkflowOneFromJsonRun),
    buildGitHubWorkflowRunItemInRepoActivity(testOrgTestWorkflowOneFromJsonRun)
  ])
  expect(appState.dynamoDB.getAllFromTable(fakeTableNames['github-latest-workflow-runs'])).toEqual([
    buildGitHubWorkflowRunEventInLatest(testOrgTestWorkflowOneFromJsonRun)
  ])

  expect(appState.eventBridgeBus.sentEvents.length).toEqual(1)
  expect(appState.eventBridgeBus.sentEvents[0].detailType).toEqual('GithubNewWorkflowRunEvent')
  expect(JSON.parse(appState.eventBridgeBus.sentEvents[0].detail)).toEqual({
    data: testOrgTestWorkflowOneFromJsonRun
  })
})
