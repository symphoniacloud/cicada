import { expect, test } from 'vitest'
import { handleWebRequest } from '../../../../../src/app/lambdaFunctions/authenticatedWeb/lambda'
import { createStubApiGatewayProxyEventWithToken } from '../../../../testSupport/fakes/awsStubs'
import { FakeAppState } from '../../../../testSupport/fakes/fakeAppState'
import {
  testOrgTestRepoOne,
  testTestUser,
  testTestUserMembershipOfOrg
} from '../../../../examples/cicada/githubDomainObjects'
import { GITHUB_ACCOUNT_MEMBERSHIP } from '../../../../../src/app/domain/entityStore/entityTypes'

test('view-repo-heading', async () => {
  const appState = setupState()

  const viewRepoResponse = await handleWebRequest(
    appState,
    createStubApiGatewayProxyEventWithToken('validUserToken', {
      path: '/app/fragment/repo/heading',
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

  return appState
}
