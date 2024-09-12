import { expect, test } from 'vitest'
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

test('repository-crawler-for-personal-account-installation', async () => {
  // A
  const appState = new FakeAppState()
  const githubInstallationClient = new FakeGithubInstallationClient()
  appState.githubClient.fakeClientsForInstallation.addResponse(48093071, githubInstallationClient)
  githubInstallationClient.stubInstallationRepositories = [example_personal_account_repo]

  // A
  await crawlRepositories(appState, testPersonalInstallation)

  // A
  expect(appState.dynamoDB.batchWrites.length).toEqual(1)
  expect(appState.dynamoDB.batchWrites[0]).toEqual({
    RequestItems: {
      fakeGithubRepositoriesTable: [
        {
          PutRequest: {
            Item: {
              PK: 'OWNER#162360409',
              SK: 'REPO#767679529',
              _et: 'githubRepository',
              _lastUpdated: '2024-02-02T19:00:00.000Z',
              ...testPersonalTestRepo
            }
          }
        }
      ]
    }
  })
})

test('repository-crawler-for-org-installation', async () => {
  // A
  const appState = new FakeAppState()
  const githubInstallationClient = new FakeGithubInstallationClient()
  appState.githubClient.fakeClientsForInstallation.addResponse(48133709, githubInstallationClient)
  githubInstallationClient.stubOrganizationRepositories.addResponse('cicada-test-org', example_org_repos)

  // A
  await crawlRepositories(appState, testOrgInstallation)

  // A
  expect(appState.dynamoDB.batchWrites.length).toEqual(1)

  expect(appState.dynamoDB.batchWrites[0]).toEqual({
    RequestItems: {
      fakeGithubRepositoriesTable: [
        {
          PutRequest: {
            Item: {
              PK: 'OWNER#162483619',
              SK: 'REPO#768206479',
              _et: 'githubRepository',
              _lastUpdated: '2024-02-02T19:00:00.000Z',
              ...testOrgTestRepoOne
            }
          }
        },
        {
          PutRequest: {
            Item: {
              PK: 'OWNER#162483619',
              SK: 'REPO#768207426',
              _et: 'githubRepository',
              _lastUpdated: '2024-02-02T19:00:00.000Z',
              ...testOrgTestRepoTwo
            }
          }
        }
      ]
    }
  })
})
