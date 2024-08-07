import { expect, test } from 'vitest'
import { createStubApiGatewayProxyEvent } from '../../../../../testSupport/fakes/awsStubs'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState'
import { GITHUB_USER } from '../../../../../../src/app/domain/entityStore/entityTypes'
import { handleGitHubWebAuthRequest } from '../../../../../../src/app/domain/github/githubUserAuth/githubWebAuthHandler'

test('login', async () => {
  const response = await handleGitHubWebAuthRequest(
    new FakeAppState(),
    createStubApiGatewayProxyEvent({
      httpMethod: 'GET',
      path: '/github/auth/login'
    })
  )

  expect(response.statusCode).toEqual(302)
  expect(response.headers?.['Location']).toEqual(
    'https://github.com/login/oauth/authorize?client_id=&redirect_uri=https://fake-cicada.example.com/github/auth/callback&scope=user:email&state=testCallbackState'
  )
})

test('oauthCallback', async () => {
  const appState = new FakeAppState()

  // Arrange
  appState.githubClient.stubOAuthUserAuths.addResponse('testCallbackCode', {
    token: 'validUserToken',
    clientId: '',
    clientSecret: '',
    clientType: 'oauth-app',
    scopes: [],
    tokenType: 'oauth',
    type: 'token'
  })
  appState.githubClient.stubGithubUsers.addResponse('validUserToken', {
    login: 'testLogin',
    id: 123456,
    avatar_url: '',
    html_url: '',
    type: '',
    url: ''
  })
  appState.dynamoDB.stubGets.addResponse(
    {
      TableName: 'fakeGithubUsersTable',
      Key: {
        PK: 'USER#123456'
      }
    },
    {
      Item: {
        PK: 'USER#123456',
        _et: GITHUB_USER,
        login: 'fakeUserLogin',
        id: 123456,
        avatarUrl: '',
        htmlUrl: '',
        url: ''
      },
      $metadata: {}
    }
  )

  // Act
  const response = await handleGitHubWebAuthRequest(
    appState,
    createStubApiGatewayProxyEvent({
      httpMethod: 'GET',
      path: '/github/auth/callback',
      queryStringParameters: {
        code: 'testCallbackCode',
        state: 'testCallbackState'
      }
    })
  )

  // Assert
  expect(response.statusCode).toEqual(302)
  expect(response.multiValueHeaders?.['Location']).toEqual(['https://fake-cicada.example.com/app'])
  // Expires 1 day before "now" where now is defined in appState's clock (which defaults to defaultFakeNowIso)
  expect(response.multiValueHeaders?.['Set-Cookie']).toEqual([
    'token=validUserToken; Secure; HttpOnly; SameSite=Lax; Domain=fake-cicada.example.com; Expires=Mon, 05 Feb 2024 19:00:00 GMT; Path=/',
    'loggedIn=true; Secure; SameSite=Lax; Domain=fake-cicada.example.com; Expires=Mon, 05 Feb 2024 19:00:00 GMT; Path=/'
  ])
})

test('failedOauthCallback', async () => {
  const appState = new FakeAppState()

  const response = await handleGitHubWebAuthRequest(
    appState,
    createStubApiGatewayProxyEvent({
      httpMethod: 'GET',
      path: '/github/auth/callback'
    })
  )

  // Assert
  expect(response.statusCode).toEqual(400)
  expect(response.multiValueHeaders).toBeUndefined()
  expect(response.body).toEqual(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"></meta>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"></meta>
    <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
    <title>Cicada</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous"></link>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"></link>
  </head>
  <body>
    <div class="container" id="toplevel">
      <h2>Cicada</h2>
      <p>Unable to login because there was no code on request</p>
      <hr></hr>
      <p>
        <a href="web-push.html">Manage Web Push Notifications</a>
      </p>
      <p>
        <a href="/">Back to home</a>
      </p>
      <p>
        <a href="/github/auth/logout">Logout</a>
      </p>
    </div>
  </body>
</html>`)
})

test('logout', async () => {
  const response = await handleGitHubWebAuthRequest(
    new FakeAppState(),
    createStubApiGatewayProxyEvent({
      httpMethod: 'GET',
      path: '/github/auth/logout'
    })
  )

  expect(response.statusCode).toEqual(302)
  expect(response.multiValueHeaders?.['Location']).toEqual(['https://fake-cicada.example.com/index.html'])
  // Expires 1 day before "now" where now is defined in appState's clock (which defaults to defaultFakeNowIso)
  expect(response.multiValueHeaders?.['Set-Cookie']).toEqual([
    'token=none; Secure; HttpOnly; SameSite=Lax; Domain=fake-cicada.example.com; Expires=Thu, 01 Feb 2024 19:00:00 GMT; Path=/',
    'loggedIn=false; Secure; SameSite=Lax; Domain=fake-cicada.example.com; Expires=Thu, 01 Feb 2024 19:00:00 GMT; Path=/'
  ])
})

test('invalidPath', async () => {
  const response = await handleGitHubWebAuthRequest(
    new FakeAppState(),
    createStubApiGatewayProxyEvent({
      path: '/github/auth/other'
    })
  )

  expect(response.statusCode).toEqual(404)
  expect(response.body).toEqual('"Not Found"')
})
