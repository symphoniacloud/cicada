import { expect, test } from 'vitest'
import { createStubApiGatewayProxyEvent } from '../../../../../testSupport/fakes/awsStubs.js'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState.js'
import { handleGitHubWebAuthRequest } from '../../../../../../src/app/domain/github/githubUserAuth/githubWebAuthHandler.js'
import { buildGitHubUserItem } from '../../../../../testSupport/builders/dynamoDBItemBuilders.js'
import { testTestUser } from '../../../../../examples/cicada/githubDomainObjects.js'
import { withSuppressedWarningLogs } from '../../../../../testSupport/logging.js'

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
    id: 162360409,
    avatar_url: '',
    html_url: '',
    type: 'User',
    url: ''
  })
  appState.putToTable('github-users', buildGitHubUserItem(testTestUser))

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
  await withSuppressedWarningLogs(async () => {
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
    <script src="/js/htmx.min.js" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous"></link>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"></link>
  </head>
  <body>
    <div class="container" id="toplevel">
      <h1 class="display-3 mt-4">Cicada</h1>
      <p>Unable to login because request was invalid</p>
      <hr></hr>
      <p>
        <a href="/">Back to home</a>
      </p>
      <p>
        <a href="/userSettings">User Settings</a>
      </p>
      <p>
        <a href="/app/admin">Global admin</a>
      </p>
      <p>
        <a href="/github/auth/logout">Logout</a>
      </p>
    </div>
  </body>
</html>`)
  })
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
  await withSuppressedWarningLogs(async () => {
    const response = await handleGitHubWebAuthRequest(
      new FakeAppState(),
      createStubApiGatewayProxyEvent({
        path: '/github/auth/other'
      })
    )

    expect(response.statusCode).toEqual(404)
    expect(response.body).toEqual('"Not Found"')
  })
})
