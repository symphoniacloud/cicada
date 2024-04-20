import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState'
import { githubWebhookInstallationProcessor } from '../../../../../../src/app/domain/github/webhookProcessor/processors/githubWebhookInstallationProcessor'
import { FakeGithubInstallationClient } from '../../../../../testSupport/fakes/fakeGithubInstallationClient'

import example_installation_created from '../../../../../examples/github/org/webhook/installationCreated.json'
import example_org_users from '../../../../../examples/github/org/api/users.json'
import example_org_repos from '../../../../../examples/github/org/api/repos.json'
import example_org_workflow_run from '../../../../../examples/github/org/api/workflowRunEvent.json'
import example_org_repo_push from '../../../../../examples/github/org/api/repoPush.json'
import { testOrgInstallation } from '../../../../../examples/cicada/githubDomainObjects'

test('installation-webhook-for-org-account-installation', async () => {
  // A
  const appState = new FakeAppState()
  appState.config.fakeGithubConfig = {
    ...appState.config.fakeGithubConfig,
    appId: '850768'
  }
  const githubInstallationClient = new FakeGithubInstallationClient()
  appState.githubClient.fakeClientsForInstallation.addResponse(48133709, githubInstallationClient)
  githubInstallationClient.stubOrganizationMembers.addResponse('cicada-test-org', example_org_users)
  githubInstallationClient.stubOrganizationRepositories.addResponse('cicada-test-org', example_org_repos)
  githubInstallationClient.stubWorkflowRunsForRepo.addResponse(
    {
      owner: 'cicada-test-org',
      repo: 'org-test-repo-one',
      created: '>2023-11-04T19:00:00.000Z'
    },
    [example_org_workflow_run]
  )
  githubInstallationClient.stubWorkflowRunsForRepo.addResponse(
    {
      owner: 'cicada-test-org',
      repo: 'org-test-repo-two',
      created: '>2023-11-04T19:00:00.000Z'
    },
    []
  )
  githubInstallationClient.stubMostRecentEventsForRepo.addResponse(
    {
      owner: 'cicada-test-org',
      repo: 'org-test-repo-one'
    },
    [example_org_repo_push]
  )
  githubInstallationClient.stubMostRecentEventsForRepo.addResponse(
    {
      owner: 'cicada-test-org',
      repo: 'org-test-repo-two'
    },
    []
  )

  // A
  await githubWebhookInstallationProcessor(appState, JSON.stringify(example_installation_created))

  // A
  expect(appState.dynamoDB.puts.length).toEqual(5)
  expect(appState.dynamoDB.puts[0]).toEqual({
    Item: {
      PK: 'ACCOUNT#162483619',
      _et: 'githubInstallation',
      _lastUpdated: '2024-02-02T19:00:00.000Z',
      ...testOrgInstallation
    },
    TableName: 'fakeGithubInstallationsTable'
  })
  expect(appState.dynamoDB.puts[1].Item?.['_et']).toEqual('githubWorkflowRunEvent')
  expect(appState.dynamoDB.puts[2].Item?.['_et']).toEqual('githubLatestWorkflowRunEvent')
  expect(appState.dynamoDB.puts[3].Item?.['_et']).toEqual('githubPush')
  expect(appState.dynamoDB.puts[4].Item?.['_et']).toEqual('githubLatestPushPerRef')

  expect(appState.dynamoDB.batchWrites.length).toEqual(3)
})
