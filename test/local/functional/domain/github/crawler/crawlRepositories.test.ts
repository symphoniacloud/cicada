import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState.js'
import { FakeGithubInstallationClient } from '../../../../../testSupport/fakes/fakeGithubInstallationClient.js'
import {
  cicadaTestOrgInstallation,
  cicadaTestUserInstallation,
  testOrgTestRepoOne,
  testOrgTestRepoTwo,
  testPersonalTestRepo
} from '../../../../../examples/cicada/githubDomainObjects.js'
import example_personal_account_repo from '../../../../../examples/github/personal-account/api/repo.json' with { type: 'json' }
import example_org_repos from '../../../../../examples/github/org/api/repos.json' with { type: 'json' }
import { crawlAccountContents } from '../../../../../../src/app/domain/github/crawler/crawlAccountContents.js'
import { buildGitHubRepoItem } from '../../../../../testSupport/fakes/itemBuilders.js'
import { RawGithubRepoSchema } from '../../../../../../src/app/ioTypes/RawGitHubSchemas.js'
import { fakeTableNames } from '../../../../../testSupport/fakes/fakeCicadaConfig.js'

test('repository-crawler-for-personal-account-installation', async () => {
  // A
  const appState = new FakeAppState()
  const githubInstallationClient = new FakeGithubInstallationClient()
  githubInstallationClient.stubInstallationRepositories = [
    RawGithubRepoSchema.parse(example_personal_account_repo)
  ]
  githubInstallationClient.stubWorkflowsForRepo.addResponse(
    {
      owner: 'cicada-test-user',
      repo: 'personal-test-repo'
    },
    []
  )
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
  await crawlAccountContents(appState, githubInstallationClient, cicadaTestUserInstallation, 3)

  // A
  expect(appState.dynamoDB.getAllFromTable(fakeTableNames['github-repositories'])).toEqual([
    buildGitHubRepoItem(testPersonalTestRepo)
  ])
})

test('repository-crawler-for-org-installation', async () => {
  // A
  const appState = new FakeAppState()
  const githubInstallationClient = new FakeGithubInstallationClient()
  githubInstallationClient.stubOrganizationRepositories.addResponse(
    'cicada-test-org',
    example_org_repos.map((x) => RawGithubRepoSchema.parse(x))
  )
  githubInstallationClient.stubWorkflowsForRepo.addResponse(
    {
      owner: 'cicada-test-org',
      repo: 'org-test-repo-one'
    },
    []
  )
  githubInstallationClient.stubWorkflowsForRepo.addResponse(
    {
      owner: 'cicada-test-org',
      repo: 'org-test-repo-two'
    },
    []
  )

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
  await crawlAccountContents(appState, githubInstallationClient, cicadaTestOrgInstallation, 3)

  // A
  expect(appState.dynamoDB.getAllFromTable(fakeTableNames['github-repositories'])).toEqual([
    buildGitHubRepoItem(testOrgTestRepoOne),
    buildGitHubRepoItem(testOrgTestRepoTwo)
  ])
})
