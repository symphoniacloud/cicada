import { expect, test } from 'vitest'
import { FakeAppState } from '../../../testSupport/fakes/fakeAppState'
import { handleWebRequest } from '../../../../src/app/lambdaFunctions/authenticatedWeb/lambda'
import { createStubApiGatewayProxyEventWithToken } from '../../../testSupport/fakes/awsStubs'
import {
  stubGetGithubInstallation,
  stubQueryActivityForRepo,
  stubQueryLatestWorkflowRuns,
  stubQueryLatestWorkflowRunsForRepo,
  stubQueryRepositories,
  stubSetupUserRecords
} from '../../../testSupport/fakes/tableRecordReadStubs'

function setupState() {
  const appState = new FakeAppState()

  stubGetGithubInstallation(appState)
  stubSetupUserRecords(appState)
  stubQueryRepositories(appState)
  stubQueryActivityForRepo(appState)
  stubQueryLatestWorkflowRunsForRepo(appState)
  // Used when loading "all workflows" for user settings lookup. Eventually consider adding a workflows entity
  stubQueryLatestWorkflowRuns(appState)

  return appState
}

test('view-repo-actions-status', async () => {
  const appState = setupState()

  const viewRepoResponse = await handleWebRequest(
    appState,
    createStubApiGatewayProxyEventWithToken('validUserToken', {
      path: '/app/fragment/actionsStatus',
      queryStringParameters: { accountId: 'GHAccount162483619', repoId: 'GHRepo768206479' }
    })
  )

  expect(viewRepoResponse.statusCode).toEqual(200)
  expect(viewRepoResponse.headers).toEqual({
    'Content-Type': 'text/html'
  })
  expect(viewRepoResponse.body).toEqual(`<table class="table">
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
  <tbody>
    <tr class="table-success">
      <td>
        <a href="/workflow?accountId=GHAccount162483619&repoId=GHRepo768206479&workflowId=GHWorkflow88647110">Test Repo One Workflow</a>
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
</table>`)
})

test('view-repo-recent-activity', async () => {
  const appState = setupState()

  const viewRepoResponse = await handleWebRequest(
    appState,
    createStubApiGatewayProxyEventWithToken('validUserToken', {
      path: '/app/fragment/gitHubActivity',
      queryStringParameters: { accountId: 'GHAccount162483619', repoId: 'GHRepo768206479' }
    })
  )

  expect(viewRepoResponse.statusCode).toEqual(200)
  expect(viewRepoResponse.headers).toEqual({
    'Content-Type': 'text/html'
  })
  expect(viewRepoResponse.body).toEqual(`<table class="table">
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
    <tr class="table-success">
      <td>Successful Run</td>
      <td>
        <a href="/workflow?accountId=GHAccount162483619&repoId=GHRepo768206479&workflowId=GHWorkflow88647110">Test Repo One Workflow</a>
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
</table>`)
})
