import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../testSupport/fakes/fakeAppState'
import {
  testOrgTestRepoOneWorkflowRunThree,
  testTestUser,
  testTestUserMembershipOfOrg,
  testTestUserTokenRecord
} from '../../../../examples/cicada/githubDomainObjects'
import {
  GITHUB_ACCOUNT_MEMBERSHIP,
  GITHUB_LATEST_WORKFLOW_RUN_EVENT
} from '../../../../../src/app/domain/entityStore/entityTypes'
import { handleWebRequest } from '../../../../../src/app/lambdaFunctions/authenticatedWeb/lambda'
import { createStubApiGatewayProxyEventWithToken } from '../../../../testSupport/fakes/awsStubs'

test('home-actions-status', async () => {
  const appState = new FakeAppState()
  appState.dynamoDB.stubGets.addResponse(
    {
      TableName: 'fakeGithubUserTokensTable',
      Key: { PK: 'USER_TOKEN#validUserToken' }
    },
    {
      $metadata: {},
      Item: testTestUserTokenRecord
    }
  )
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

  const latestActivity = await handleWebRequest(
    appState,
    createStubApiGatewayProxyEventWithToken('validUserToken', {
      path: '/app/fragment/actionsStatus'
    })
  )

  expect(latestActivity.statusCode).toEqual(200)
  expect(latestActivity.headers).toEqual({
    'Content-Type': 'text/html'
  })
  expect(latestActivity.body).toEqual(
    `<table class="table">
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
        <a href="/workflow?ownerId=162483619&repoId=768206479&workflowId=88647110">Test Repo One Workflow</a>
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
</table>`
  )
})
