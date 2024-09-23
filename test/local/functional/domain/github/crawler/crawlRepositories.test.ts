import { test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState'
import { FakeGithubInstallationClient } from '../../../../../testSupport/fakes/fakeGithubInstallationClient'
import {
  testOrgInstallation,
  testOrgTestRepoOne,
  testOrgTestRepoTwo,
  testPersonalInstallation,
  testPersonalTestRepo
} from '../../../../../examples/cicada/githubDomainObjects'
import example_personal_account_repo from '../../../../../examples/github/personal-account/api/repo.json'
import example_org_repos from '../../../../../examples/github/org/api/repos.json'
import { crawlRepositories } from '../../../../../../src/app/domain/github/crawler/crawlRepositories'
import {
  expectBatchWrites,
  expectBatchWritesLength
} from '../../../../../testSupport/fakes/dynamoDB/fakeDynamoDBInterfaceExpectations'
import { expectedBatchWriteGithubRepositories } from '../../../../../testSupport/fakes/tableRecordExpectedWrites'

test('repository-crawler-for-personal-account-installation', async () => {
  // A
  const appState = new FakeAppState()
  const githubInstallationClient = new FakeGithubInstallationClient()
  githubInstallationClient.stubInstallationRepositories = [example_personal_account_repo]
  githubInstallationClient.stubMostRecentEventsForRepo.addResponse(
    {
      owner: 'cicada-test-user',
      repo: 'personal-test-repo'
    },
    []
  )
  githubInstallationClient.stubWorkflowRunsForRepo.addResponse(
    {
      owner: 'cicada-test-user',
      repo: 'personal-test-repo',
      created: '>2024-02-02T16:00:00.000Z'
    },
    []
  )

  // A
  await crawlRepositories(appState, testPersonalInstallation, githubInstallationClient, 3)

  // A
  expectBatchWritesLength(appState).toEqual(1)
  expectBatchWrites(appState, 0).toEqual(expectedBatchWriteGithubRepositories([testPersonalTestRepo]))
})

test('repository-crawler-for-org-installation', async () => {
  // A
  const appState = new FakeAppState()
  const githubInstallationClient = new FakeGithubInstallationClient()
  githubInstallationClient.stubOrganizationRepositories.addResponse('cicada-test-org', example_org_repos)
  githubInstallationClient.stubMostRecentEventsForRepo.addResponse(
    {
      owner: 'cicada-test-org',
      repo: 'org-test-repo-one'
    },
    []
  )
  githubInstallationClient.stubMostRecentEventsForRepo.addResponse(
    {
      owner: 'cicada-test-org',
      repo: 'org-test-repo-two'
    },
    []
  )
  githubInstallationClient.stubWorkflowRunsForRepo.addResponse(
    {
      owner: 'cicada-test-org',
      repo: 'org-test-repo-one',
      created: '>2024-02-02T16:00:00.000Z'
    },
    []
  )
  githubInstallationClient.stubWorkflowRunsForRepo.addResponse(
    {
      owner: 'cicada-test-org',
      repo: 'org-test-repo-two',
      created: '>2024-02-02T16:00:00.000Z'
    },
    []
  )

  // A
  await crawlRepositories(appState, testOrgInstallation, githubInstallationClient, 3)

  // A
  expectBatchWritesLength(appState).toEqual(1)
  expectBatchWrites(appState, 0).toEqual(
    expectedBatchWriteGithubRepositories([testOrgTestRepoOne, testOrgTestRepoTwo])
  )
})
