import { expect, test } from 'vitest'
import { handleWebRequest } from '../../../../../src/app/lambdaFunctions/authenticatedWeb/lambda'
import { createStubApiGatewayProxyEventWithToken } from '../../../../testSupport/fakes/awsStubs'
import { FakeAppState } from '../../../../testSupport/fakes/fakeAppState'
import { stubGetRepo, stubSetupUserRecords } from '../../../../testSupport/fakes/tableRecordReadStubs'

test('view-repo-heading', async () => {
  const appState = new FakeAppState()

  stubSetupUserRecords(appState)
  stubGetRepo(appState)

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
