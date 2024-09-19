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

  // A
  await crawlRepositories(appState, testPersonalInstallation, githubInstallationClient)

  // A
  expectBatchWritesLength(appState).toEqual(1)
  expectBatchWrites(appState, 0).toEqual(expectedBatchWriteGithubRepositories([testPersonalTestRepo]))
})

test('repository-crawler-for-org-installation', async () => {
  // A
  const appState = new FakeAppState()
  const githubInstallationClient = new FakeGithubInstallationClient()
  githubInstallationClient.stubOrganizationRepositories.addResponse('cicada-test-org', example_org_repos)

  // A
  await crawlRepositories(appState, testOrgInstallation, githubInstallationClient)

  // A
  expectBatchWritesLength(appState).toEqual(1)
  expectBatchWrites(appState, 0).toEqual(
    expectedBatchWriteGithubRepositories([testOrgTestRepoOne, testOrgTestRepoTwo])
  )
})
