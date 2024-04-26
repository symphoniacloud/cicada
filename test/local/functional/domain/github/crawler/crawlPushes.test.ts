import { expect, test } from 'vitest'
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

test('repo-crawler-for-personal-account-installation', async () => {
  // A
  const appState = new FakeAppState()
  const githubInstallationClient = new FakeGithubInstallationClient()
  appState.githubClient.fakeClientsForInstallation.addResponse(48093071, githubInstallationClient)
  githubInstallationClient.stubMostRecentEventsForRepo.addResponse(
    {
      owner: 'cicada-test-user',
      repo: 'personal-test-repo'
    },
    [example_personal_repo_push]
  )

  // A
  await crawlPushes(appState, testPersonalInstallation, testPersonalTestRepo)

  // A
  expect(appState.dynamoDB.puts.length).toEqual(2)
  expect(appState.dynamoDB.puts[0]).toEqual({
    ConditionExpression: 'attribute_not_exists(PK)',
    Item: {
      PK: 'ACCOUNT#162360409',
      SK: 'REPO#767679529#REF#refs/heads/main#PUSH#COMMIT#dfb5cb80ad3ce5a19a5020b4645696b2d6b4d94c',
      GSI1PK: 'ACCOUNT#162360409',
      GSI1SK: 'REPO#767679529#DATETIME#2024-03-05T18:01:12Z',
      _et: 'githubPush',
      _lastUpdated: '2024-02-02T19:00:00.000Z',
      ...testPersonalTestRepoPush
    },
    TableName: 'fakeGithubRepoActivityTable'
  })
  expect(appState.dynamoDB.puts[1]).toEqual({
    ConditionExpression: 'attribute_not_exists(PK) OR #dateTime < :newDateTime',
    ExpressionAttributeNames: {
      '#dateTime': 'dateTime'
    },
    ExpressionAttributeValues: {
      ':newDateTime': '2024-03-05T18:01:12Z'
    },
    Item: {
      PK: 'ACCOUNT#162360409',
      SK: 'REPO#767679529#REF#refs/heads/main',
      GSI1PK: 'ACCOUNT#162360409',
      GSI1SK: 'DATETIME#2024-03-05T18:01:12Z',
      _et: 'githubLatestPushPerRef',
      _lastUpdated: '2024-02-02T19:00:00.000Z',
      ...testPersonalTestRepoPush
    },
    TableName: 'fakeGithubLatestPushesPerRefTable'
  })
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
  await crawlPushes(appState, testOrgInstallation, testOrgTestRepoOne)

  // A
  expect(appState.dynamoDB.puts.length).toEqual(2)
  expect(appState.dynamoDB.puts[0]).toEqual({
    ConditionExpression: 'attribute_not_exists(PK)',
    Item: {
      PK: 'ACCOUNT#162483619',
      SK: 'REPO#768206479#REF#refs/heads/main#PUSH#COMMIT#8c3aa1cb0316ea23abeb2612457edb80868f53c8',
      GSI1PK: 'ACCOUNT#162483619',
      GSI1SK: 'REPO#768206479#DATETIME#2024-03-06T17:00:40Z',
      _et: 'githubPush',
      _lastUpdated: '2024-02-02T19:00:00.000Z',
      ...testOrgTestRepoOnePush
    },
    TableName: 'fakeGithubRepoActivityTable'
  })
  expect(appState.dynamoDB.puts[1]).toEqual({
    ConditionExpression: 'attribute_not_exists(PK) OR #dateTime < :newDateTime',
    ExpressionAttributeNames: {
      '#dateTime': 'dateTime'
    },
    ExpressionAttributeValues: {
      ':newDateTime': '2024-03-06T17:00:40Z'
    },
    Item: {
      PK: 'ACCOUNT#162483619',
      SK: 'REPO#768206479#REF#refs/heads/main',
      GSI1PK: 'ACCOUNT#162483619',
      GSI1SK: 'DATETIME#2024-03-06T17:00:40Z',
      _et: 'githubLatestPushPerRef',
      _lastUpdated: '2024-02-02T19:00:00.000Z',
      ...testOrgTestRepoOnePush
    },
    TableName: 'fakeGithubLatestPushesPerRefTable'
  })
})
