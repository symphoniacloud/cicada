import { expect, test } from 'vitest'
import { FakeAppState } from '../../../testSupport/fakes/fakeAppState'
import {
  testOrgTestRepoOnePush,
  testOrgTestRepoOneWorkflowRunThree,
  testTestUser,
  testTestUserMembershipOfOrg
} from '../../../examples/cicada/githubDomainObjects'
import {
  GITHUB_ACCOUNT_MEMBERSHIP,
  GITHUB_LATEST_PUSH_PER_REF,
  GITHUB_LATEST_WORKFLOW_RUN_EVENT
} from '../../../../src/app/domain/entityStore/entityTypes'
import { handleWebRequest } from '../../../../src/app/lambdaFunctions/authenticatedWeb/lambda'
import { createStubApiGatewayProxyEventWithToken } from '../../../testSupport/fakes/awsStubs'

test('latest-activity', async () => {
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
      TableName: 'fakeGithubLatestWorkflowRunsTable',
      KeyConditionExpression: 'GSI1PK = :pk',
      IndexName: 'GSI1',
      ExpressionAttributeValues: { ':pk': 'ACCOUNT#162483619' },
      ScanIndexForward: false
    },
    [
      {
        $metadata: {},
        Items: [{ ...testOrgTestRepoOneWorkflowRunThree, _et: GITHUB_LATEST_WORKFLOW_RUN_EVENT }]
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

  const latestActivity = await handleWebRequest(
    appState,
    createStubApiGatewayProxyEventWithToken('validUserToken', {
      path: '/app/fragment/latestActivity'
    })
  )

  expect(latestActivity.statusCode).toEqual(200)
  expect(latestActivity.headers).toEqual({
    'Content-Type': 'text/html'
  })
  expect(latestActivity.body).toEqual(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Cicada</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
  </head>
  <body>
    <h3>GitHub Actions Status</h3>
    <table class="table">
      <thead>
        <tr>
          <th>Repo</th>
          <th>Workflow</th>
          <th>Status</th>
          <th>When</th>
          <th>Duration</th>
          <th>By</th>
          <th>Commit</th>
        </tr>
      </thead>
      <tbody>
        <tr class="success">
          <td>
            <a href="/repo?ownerId=162483619&repoId=768206479">org-test-repo-one</a>
&nbsp;
            <a href="https://github.com/cicada-test-org/org-test-repo-one"><i class='bi bi-github' style='color: #6e5494'></i></a>
          </td>
          <td>
            <a href="/app/account/162483619/repo/768206479/workflow/88647110">Test Repo One Workflow</a>
&nbsp;
            <a href="https://github.com/cicada-test-org/org-test-repo-one/actions/workflows/test.yml"><i class='bi bi-github' style='color: #6e5494'></i></a>
          </td>
          <td>Success</td>
          <td>
2024-03-06T19:25:42Z
&nbsp;
            <a href="https://github.com/cicada-test-org/org-test-repo-one/actions/runs/8177622236"><i class='bi bi-github' style='color: #6e5494'></i></a>
          </td>
          <td>10 seconds</td>
          <td>
mikebroberts
&nbsp;
            <a href="https://github.com/mikebroberts"><i class='bi bi-github' style='color: #6e5494'></i></a>
          </td>
          <td>
Test Repo One Workflow
&nbsp;
            <a href="https://github.com/cicada-test-org/org-test-repo-one/commit/8c3aa1cb0316ea23abeb2612457edb80868f53c8"><i class='bi bi-github' style='color: #6e5494'></i></a>
          </td>
        </tr>
      </tbody>
    </table>
    <h3>Recent Branch Activity</h3>
    <table class="table">
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
    </table>
  </body>
</html>`
  )
})
