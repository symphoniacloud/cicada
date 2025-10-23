import { test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState.js'
import { FakeGithubInstallationClient } from '../../../../../testSupport/fakes/fakeGithubInstallationClient.js'
import {
  testOrgTestRepoOne,
  testOrgTestRepoOnePush,
  testPersonalTestRepo,
  testPersonalTestRepoPush
} from '../../../../../examples/cicada/githubDomainObjects.js'
import example_personal_repo_push from '../../../../../examples/github/personal-account/api/repoPush.json' with { type: 'json' }
import example_org_repo_push from '../../../../../examples/github/org/api/repoPush.json' with { type: 'json' }
import { crawlPushes } from '../../../../../../src/app/domain/github/crawler/crawlPushes.js'
import {
  expectPut,
  expectPutsLength
} from '../../../../../testSupport/fakes/dynamoDB/fakeDynamoDBInterfaceExpectations.js'
import {
  expectedPutGithubPush,
  expectedPutLatestGithubPush
} from '../../../../../testSupport/fakes/tableRecordExpectedWrites.js'

import { fromRawGithubInstallationId } from '../../../../../../src/app/domain/types/toFromRawGitHubIds.js'

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
  await crawlPushes(appState, testPersonalTestRepo, githubInstallationClient)

  // A
  expectPutsLength(appState).toEqual(2)
  expectPut(appState, 0).toEqual(expectedPutGithubPush(testPersonalTestRepoPush))
  expectPut(appState, 1).toEqual(expectedPutLatestGithubPush(testPersonalTestRepoPush))
})

test('repo-crawler-for-org-installation', async () => {
  // A
  const appState = new FakeAppState()
  const githubInstallationClient = new FakeGithubInstallationClient()
  appState.githubClient.fakeClientsForInstallation.addResponse(
    fromRawGithubInstallationId(48133709),
    githubInstallationClient
  )
  githubInstallationClient.stubMostRecentEventsForRepo.addResponse(
    {
      owner: 'cicada-test-org',
      repo: 'org-test-repo-one'
    },
    [example_org_repo_push]
  )

  // A
  await crawlPushes(appState, testOrgTestRepoOne, githubInstallationClient)

  // A
  expectPutsLength(appState).toEqual(2)
  expectPut(appState, 0).toEqual(expectedPutGithubPush(testOrgTestRepoOnePush))
  expectPut(appState, 1).toEqual(expectedPutLatestGithubPush(testOrgTestRepoOnePush))
})
