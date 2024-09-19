import { test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState'
import { FakeGithubInstallationClient } from '../../../../../testSupport/fakes/fakeGithubInstallationClient'
import {
  testOrgInstallation,
  testOrgTestRepoOne,
  testOrgTestRepoOnePush,
  testPersonalInstallation,
  testPersonalTestRepo,
  testPersonalTestRepoPush
} from '../../../../../examples/cicada/githubDomainObjects'
import example_personal_repo_push from '../../../../../examples/github/personal-account/api/repoPush.json'
import example_org_repo_push from '../../../../../examples/github/org/api/repoPush.json'
import { crawlPushes } from '../../../../../../src/app/domain/github/crawler/crawlPushes'
import {
  expectPut,
  expectPutsLength
} from '../../../../../testSupport/fakes/dynamoDB/fakeDynamoDBInterfaceExpectations'
import {
  expectedPutGithubPush,
  expectedPutLatestGithubPush
} from '../../../../../testSupport/fakes/tableRecordExpectedWrites'

test('repo-crawler-for-personal-account-installation', async () => {
  // A
  const appState = new FakeAppState()
  const githubInstallationClient = new FakeGithubInstallationClient()
  githubInstallationClient.stubMostRecentEventsForRepo.addResponse(
    {
      owner: 'cicada-test-user',
      repo: 'personal-test-repo'
    },
    [example_personal_repo_push]
  )

  // A
  await crawlPushes(appState, testPersonalInstallation, testPersonalTestRepo, githubInstallationClient)

  // A
  expectPutsLength(appState).toEqual(2)
  expectPut(appState, 0).toEqual(expectedPutGithubPush(testPersonalTestRepoPush))
  expectPut(appState, 1).toEqual(expectedPutLatestGithubPush(testPersonalTestRepoPush))
})

test('repo-crawler-for-org-installation', async () => {
  // A
  const appState = new FakeAppState()
  const githubInstallationClient = new FakeGithubInstallationClient()
  appState.githubClient.fakeClientsForInstallation.addResponse(48133709, githubInstallationClient)
  githubInstallationClient.stubMostRecentEventsForRepo.addResponse(
    {
      owner: 'cicada-test-org',
      repo: 'org-test-repo-one'
    },
    [example_org_repo_push]
  )

  // A
  await crawlPushes(appState, testOrgInstallation, testOrgTestRepoOne, githubInstallationClient)

  // A
  expectPutsLength(appState).toEqual(2)
  expectPut(appState, 0).toEqual(expectedPutGithubPush(testOrgTestRepoOnePush))
  expectPut(appState, 1).toEqual(expectedPutLatestGithubPush(testOrgTestRepoOnePush))
})
