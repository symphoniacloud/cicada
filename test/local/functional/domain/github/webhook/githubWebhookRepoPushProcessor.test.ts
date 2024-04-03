import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState'

import example_push from '../../../../../examples/github/org/webhook/push.json'
import { githubWebhookRepoPushProcessor } from '../../../../../../src/app/domain/github/webhookProcessor/processors/githubWebhookRepoPushProcessor'
import { testOrgTestRepoOnePushFC94 } from '../../../../../examples/cicada/githubDomainObjects'

test('push-webhook', async () => {
  const appState = new FakeAppState()

  await githubWebhookRepoPushProcessor(appState, JSON.stringify(example_push))

  expect(appState.dynamoDB.puts.length).toEqual(2)
  expect(appState.dynamoDB.puts[0]).toEqual({
    ConditionExpression: 'attribute_not_exists(PK)',
    Item: {
      PK: 'ACCOUNT#162483619',
      SK: 'REPO#768206479#REF#refs/heads/main#PUSH#COMMIT#fc94eb2b6feab026673ee6e740f3dd7fafd7c130',
      GSI1PK: 'ACCOUNT#162483619',
      GSI1SK: 'REPO#768206479#DATETIME#2024-03-06T21:26:18.000Z',
      _et: 'githubPush',
      _lastUpdated: '2024-02-02T19:00:00.000Z',
      ...testOrgTestRepoOnePushFC94
    },
    TableName: 'fakeGithubRepoActivityTable'
  })
  expect(appState.dynamoDB.puts[1]).toEqual({
    ConditionExpression: 'attribute_not_exists(PK) OR #dateTime < :newDateTime',
    ExpressionAttributeNames: {
      '#dateTime': 'dateTime'
    },
    ExpressionAttributeValues: {
      ':newDateTime': '2024-03-06T21:26:18.000Z'
    },
    Item: {
      PK: 'ACCOUNT#162483619',
      SK: 'REPO#768206479#REF#refs/heads/main',
      GSI1PK: 'ACCOUNT#162483619',
      GSI1SK: 'DATETIME#2024-03-06T21:26:18.000Z',
      _et: 'githubLatestPushPerRef',
      _lastUpdated: '2024-02-02T19:00:00.000Z',
      ...testOrgTestRepoOnePushFC94
    },
    TableName: 'fakeGithubLatestPushesPerRefTable'
  })

  expect(appState.eventBridgeBus.sentEvents.length).toEqual(1)
  expect(appState.eventBridgeBus.sentEvents[0]).toEqual({
    detailType: 'GithubNewPush',
    detail: JSON.stringify({
      data: {
        ownerId: 162483619,
        ownerName: 'cicada-test-org',
        ownerType: 'organization',
        repoId: 768206479,
        repoName: 'org-test-repo-one',
        repoUrl: 'https://github.com/cicada-test-org/org-test-repo-one',
        actor: {
          id: 49635,
          login: 'mikebroberts',
          avatarUrl: 'https://avatars.githubusercontent.com/u/49635?v=4'
        },
        dateTime: '2024-03-06T21:26:18.000Z',
        ref: 'refs/heads/main',
        before: '8c3aa1cb0316ea23abeb2612457edb80868f53c8',
        commits: [
          {
            sha: 'fc94eb2b6feab026673ee6e740f3dd7fafd7c130',
            message: 'Update README.md',
            distinct: true,
            author: { name: 'Mike Roberts', email: 'mike@symphonia.io' }
          }
        ]
      }
    })
  })
})
