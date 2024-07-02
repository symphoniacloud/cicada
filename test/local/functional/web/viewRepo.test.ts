import { expect, test } from 'vitest'
import { FakeAppState } from '../../../testSupport/fakes/fakeAppState'
import { handleWebRequest } from '../../../../src/app/lambdaFunctions/authenticatedWeb/lambda'
import { createStubApiGatewayProxyEventWithToken } from '../../../testSupport/fakes/awsStubs'
import {
  testOrgTestRepoOne,
  testOrgTestRepoOneWorkflowRunThree,
  testTestUser,
  testTestUserMembershipOfOrg
} from '../../../examples/cicada/githubDomainObjects'
import {
  GITHUB_ACCOUNT_MEMBERSHIP,
  GITHUB_WORKFLOW_RUN
} from '../../../../src/app/domain/entityStore/entityTypes'

function setupState() {
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
  appState.dynamoDB.stubGets.addResponse(
    { TableName: 'fakeGithubRepositoriesTable', Key: { PK: 'OWNER#162483619', SK: 'REPO#768206479' } },
    {
      $metadata: {},
      Item: testOrgTestRepoOne
    }
  )
  appState.dynamoDB.stubOnePageQueries.addResponse(
    {
      TableName: 'fakeGithubRepoActivityTable',
      KeyConditionExpression: 'GSI1PK = :pk and begins_with(#sk, :skPrefix)',
      IndexName: 'GSI1',
      ExpressionAttributeValues: { ':pk': 'ACCOUNT#162483619', ':skPrefix': 'REPO#768206479' },
      ExpressionAttributeNames: { '#sk': 'GSI1SK' },
      ScanIndexForward: false
    },
    {
      $metadata: {},
      Items: [{ ...testOrgTestRepoOneWorkflowRunThree, _et: GITHUB_WORKFLOW_RUN }]
    }
  )

  return appState
}

test('view-repo-heading', async () => {
  const appState = setupState()

  const viewRepoResponse = await handleWebRequest(
    appState,
    createStubApiGatewayProxyEventWithToken('validUserToken', {
      path: '/app/elements/repo/heading',
      queryStringParameters: { ownerId: '162483619', repoId: '768206479' }
    })
  )

  expect(viewRepoResponse.statusCode).toEqual(200)
  expect(viewRepoResponse.headers).toEqual({
    'Content-Type': 'text/html'
  })
  expect(viewRepoResponse.body).toEqual(`<!doctype html>
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
    <h3>
Repository: cicada-test-org/org-test-repo-one
&nbsp;
      <a href="https://github.com/cicada-test-org/org-test-repo-one"><i class='bi bi-github' style='color: #6e5494'></i></a>
    </h3>
  </body>
</html>`)
})

test('view-repo-actions-status', async () => {
  const appState = setupState()

  const viewRepoResponse = await handleWebRequest(
    appState,
    createStubApiGatewayProxyEventWithToken('validUserToken', {
      path: '/app/elements/repo/actionsStatus',
      queryStringParameters: { ownerId: '162483619', repoId: '768206479' }
    })
  )

  expect(viewRepoResponse.statusCode).toEqual(200)
  expect(viewRepoResponse.headers).toEqual({
    'Content-Type': 'text/html'
  })
  expect(viewRepoResponse.body).toEqual(`<!doctype html>
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
    <table class="table">
      <thead>
        <tr>
          <th>Workflow</th>
          <th>Status</th>
          <th>When</th>
          <th>Duration</th>
          <th>By</th>
          <th>Commit</th>
        </tr>
      </thead>
      <tbody />
    </table>
  </body>
</html>`)
})

test('view-repo-recent-activity', async () => {
  const appState = setupState()

  const viewRepoResponse = await handleWebRequest(
    appState,
    createStubApiGatewayProxyEventWithToken('validUserToken', {
      path: '/app/elements/repo/recentActivity',
      queryStringParameters: { ownerId: '162483619', repoId: '768206479' }
    })
  )

  expect(viewRepoResponse.statusCode).toEqual(200)
  expect(viewRepoResponse.headers).toEqual({
    'Content-Type': 'text/html'
  })
  expect(viewRepoResponse.body).toEqual(`<!doctype html>
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
    <table class="table">
      <thead>
        <tr>
          <th>Type</th>
          <th>Activity</th>
          <th>When</th>
          <th>By</th>
          <th>Commit</th>
        </tr>
      </thead>
      <tbody>
        <tr class="success">
          <td>Successful Run</td>
          <td>
            <a href="/app/account/162483619/repo/768206479/workflow/88647110">Test Repo One Workflow</a>
&nbsp;
            <a href="https://github.com/cicada-test-org/org-test-repo-one/actions/workflows/test.yml"><i class='bi bi-github' style='color: #6e5494'></i></a>
          </td>
          <td>
2024-03-06T19:25:42Z
&nbsp;
            <a href="https://github.com/cicada-test-org/org-test-repo-one/actions/runs/8177622236"><i class='bi bi-github' style='color: #6e5494'></i></a>
          </td>
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
  </body>
</html>`)
})
