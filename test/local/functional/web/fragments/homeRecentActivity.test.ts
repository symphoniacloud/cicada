import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../testSupport/fakes/fakeAppState'
import { handleWebRequest } from '../../../../../src/app/lambdaFunctions/authenticatedWeb/lambda'
import { createStubApiGatewayProxyEventWithToken } from '../../../../testSupport/fakes/awsStubs'
import {
  stubQueryLatestPushesPerRef,
  stubQueryLatestWorkflowRuns,
  stubQueryRepositories,
  stubSetupUserRecords
} from '../../../../testSupport/fakes/tableRecordReadStubs'

test('home-recent-activity', async () => {
  const appState = new FakeAppState()
  stubSetupUserRecords(appState)
  stubQueryLatestPushesPerRef(appState)
  stubQueryRepositories(appState)
  // Used when loading "all workflows" for user settings lookup. Eventually consider adding a workflows entity
  stubQueryLatestWorkflowRuns(appState)

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
    <tr class="table-light">
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
