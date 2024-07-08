import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../testSupport/fakes/fakeAppState'
import {
  testOrgTestRepoOnePush,
  testTestUser,
  testTestUserMembershipOfOrg
} from '../../../../examples/cicada/githubDomainObjects'
import {
  GITHUB_ACCOUNT_MEMBERSHIP,
  GITHUB_LATEST_PUSH_PER_REF
} from '../../../../../src/app/domain/entityStore/entityTypes'
import { handleWebRequest } from '../../../../../src/app/lambdaFunctions/authenticatedWeb/lambda'
import { createStubApiGatewayProxyEventWithToken } from '../../../../testSupport/fakes/awsStubs'

test('home-recent-activity', async () => {
  const appState = new FakeAppState()
  appState.githubClient.stubGithubUsers.addResponse('validUserToken', {
    login: 'cicada-test-user',
    id: 162360409,
    avatar_url: '',
    html_url: '',
    type: '',
    url: ''
  })
  appState.dynamoDB.stubGets.addResponse(
    { TableName: 'fakeGithubUsersTable', Key: { PK: 'USER#162360409' } },
    {
      $metadata: {},
      Item: testTestUser
    }
  )
  appState.dynamoDB.stubAllPagesQueries.addResponse(
    {
      TableName: 'fakeGithubAccountMemberships',
      KeyConditionExpression: 'GSI1PK = :pk',
      IndexName: 'GSI1',
      ExpressionAttributeValues: { ':pk': 'USER#162360409' }
    },
    [
      {
        $metadata: {},
        Items: [{ ...testTestUserMembershipOfOrg, _et: GITHUB_ACCOUNT_MEMBERSHIP }]
      }
    ]
  )
  appState.dynamoDB.stubAllPagesQueries.addResponse(
    {
      TableName: 'fakeGithubLatestPushesPerRefTable',
      KeyConditionExpression: 'GSI1PK = :pk and #sk > :sk',
      IndexName: 'GSI1',
      ExpressionAttributeValues: { ':pk': 'ACCOUNT#162483619', ':sk': 'DATETIME#2024-01-19T19:00:00.000Z' },
      ExpressionAttributeNames: { '#sk': 'GSI1SK' },
      ScanIndexForward: false
    },
    [
      {
        $metadata: {},
        Items: [{ ...testOrgTestRepoOnePush, _et: GITHUB_LATEST_PUSH_PER_REF }]
      }
    ]
  )

  const recentActivity = await handleWebRequest(
    appState,
    createStubApiGatewayProxyEventWithToken('validUserToken', {
      path: '/app/fragment/gitHubActivity'
    })
  )

  expect(recentActivity.statusCode).toEqual(200)
  expect(recentActivity.headers).toEqual({
    'Content-Type': 'text/html'
  })
  expect(recentActivity.body).toEqual(
    `<table class="table">
  <thead>
    <tr>
      <th>Repo</th>
      <th>Branch</th>
      <th>When</th>
      <th>By</th>
      <th>Commit</th>
    </tr>
  </thead>
  <tbody>
    <tr class="info">
      <td>
        <a href="/repo?ownerId=162483619&repoId=768206479">org-test-repo-one</a>
&nbsp;
        <a href="https://github.com/cicada-test-org/org-test-repo-one"><i class='bi bi-github' style='color: #6e5494'></i></a>
      </td>
      <td>
main
&nbsp;
        <a href="https://github.com/cicada-test-org/org-test-repo-one/tree/main"><i class='bi bi-github' style='color: #6e5494'></i></a>
      </td>
      <td>2024-03-06T17:00:40Z</td>
      <td>
mikebroberts
&nbsp;
        <a href="https://github.com/mikebroberts"><i class='bi bi-github' style='color: #6e5494'></i></a>
      </td>
      <td>
test workflow
&nbsp;
        <a href="https://github.com/cicada-test-org/org-test-repo-one/commit/8c3aa1cb0316ea23abeb2612457edb80868f53c8"><i class='bi bi-github' style='color: #6e5494'></i></a>
      </td>
    </tr>
  </tbody>
</table>`
  )
})
