import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState.js'
import { FakeGithubInstallationClient } from '../../../../../testSupport/fakes/fakeGithubInstallationClient.js'
import {
  testOrgTestRepoOne,
  testOrgTestRepoOnePushTwo,
  testPersonalTestRepo,
  testPersonalTestRepoPush
} from '../../../../../examples/cicada/githubDomainObjects.js'
import example_personal_repo_push from '../../../../../examples/github/personal-account/api/repoPush.json' with { type: 'json' }
import example_org_repo_push_two from '../../../../../examples/github/org/api/repoPush.json' with { type: 'json' }
import { crawlPushes } from '../../../../../../src/app/domain/github/crawler/crawlPushes.js'
import {
  buildGitHubPushItemInLatestPushPerRef,
  buildGitHubPushItemInRepoActivity
} from '../../../../../testSupport/builders/dynamoDBItemBuilders.js'

import { fromRawGithubInstallationId } from '../../../../../../src/app/domain/github/mappings/toFromRawGitHubIds.js'

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
  expect(appState.getAllFromTable('github-repo-activity')).toEqual([
    buildGitHubPushItemInRepoActivity(testPersonalTestRepoPush)
  ])
  expect(appState.getAllFromTable('github-latest-pushes-per-ref')).toEqual([
    buildGitHubPushItemInLatestPushPerRef(testPersonalTestRepoPush)
  ])
})

// As of October 2025 GitHub no longer provides commit summaries on PushEvents
test('crawl-pushes-for-org-with-no-commits', async () => {
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
    [example_org_repo_push_two]
  )

  // A
  await crawlPushes(appState, testOrgTestRepoOne, githubInstallationClient)

  // A
  expect(appState.getAllFromTable('github-repo-activity')).toEqual([
    buildGitHubPushItemInRepoActivity(testOrgTestRepoOnePushTwo)
  ])
  expect(appState.getAllFromTable('github-latest-pushes-per-ref')).toEqual([
    buildGitHubPushItemInLatestPushPerRef(testOrgTestRepoOnePushTwo)
  ])
})
