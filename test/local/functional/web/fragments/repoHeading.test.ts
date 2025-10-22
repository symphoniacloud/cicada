import { expect, test } from 'vitest'
import { handleWebRequest } from '../../../../../src/app/lambdaFunctions/authenticatedWeb/lambda.js'
import { createStubApiGatewayProxyEventWithToken } from '../../../../testSupport/fakes/awsStubs.js'
import { FakeAppState } from '../../../../testSupport/fakes/fakeAppState.js'
import {
  stubGetGithubInstallation,
  stubQueryRepositories,
  stubQueryWorkflows,
  stubSetupUserRecords
} from '../../../../testSupport/fakes/tableRecordReadStubs.js'

test('view-repo-heading', async () => {
  const appState = new FakeAppState()

  stubGetGithubInstallation(appState)
  stubSetupUserRecords(appState)
  stubQueryRepositories(appState)
  stubQueryWorkflows(appState)

  const viewRepoResponse = await handleWebRequest(
    appState,
    createStubApiGatewayProxyEventWithToken('validUserToken', {
      path: '/app/fragment/repo/heading',
      queryStringParameters: { accountId: 'GHAccount162483619', repoId: 'GHRepo768206479' }
    })
  )

  expect(viewRepoResponse.statusCode).toEqual(200)
  expect(viewRepoResponse.headers).toEqual({
    'Content-Type': 'text/html'
  })
  expect(viewRepoResponse.body).toEqual(`<h3>
Repository: cicada-test-org/org-test-repo-one
&nbsp;
  <a href="https://github.com/cicada-test-org/org-test-repo-one"><i class='bi bi-github' style='color: #6e5494'></i></a>
</h3>`)
})
