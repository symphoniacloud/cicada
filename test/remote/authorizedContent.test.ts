import { afterAll, expect, test } from 'vitest'
import { appStateForTests, getAppName } from './integrationTestSupport/cloudEnvironment.js'
import { randomBytes } from 'node:crypto'
import { SSM_PARAM_NAMES } from '../../src/multipleContexts/ssmParams.js'
import { sleep } from './integrationTestSupport/utils.js'
import { deleteFromSSMInTests, writeToSSMInTests } from './integrationTestSupport/ssm.js'

// Test API GW -> Authorized Lambdas, via API Gateway Authorizer
// The Authorizer code allows us to set a token for testing in SSM
test('authenticated app tests', async () => {
  const webHostName = await (await appStateForTests()).config.webHostname()
  const secret = randomBytes(32).toString('base64url')
  const token = JSON.stringify({ username: 'testuser', userId: 'GHUser1234', secret: secret })
  await writeToSSMInTests({ appName: getAppName() }, SSM_PARAM_NAMES.TEST_COOKIE_SECRET, secret)
  // Wait for SSM to propagate
  await sleep(3000)

  // Unauthorized HTML pages should return redirect
  const noTokenHtmlTestPageResponse = await fetch(`https://${webHostName}/app/hello`, {
    redirect: 'manual'
  })
  expect(noTokenHtmlTestPageResponse.status).toEqual(302)
  expect(noTokenHtmlTestPageResponse.headers.get('Location')).toEqual(`https://${webHostName}/index.html`)

  // Unauthorized HTML fragments should return 403 (handled by script in page)
  const noTokenHtmlTestFragmentResponse = await fetch(`https://${webHostName}/app/fragment/latestActivity`)
  expect(noTokenHtmlTestFragmentResponse.status).toEqual(403)

  const htmlTestPageResponse = await fetch(`https://${webHostName}/app/hello`, {
    headers: {
      Cookie: `loggedIn=true; token=${token}`
    }
  })
  expect(htmlTestPageResponse.status).toEqual(200)
  expect(await htmlTestPageResponse.text()).toEqual(`<!doctype html>
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
      <p>
Hello 
testuser
 / 
GHUser1234
      </p>
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

  const noTokenApiTestPageResponse = await fetch(`https://${webHostName}/apia/hello`)
  expect(noTokenApiTestPageResponse.status).toEqual(401)

  const apiTestPageResponse = await fetch(`https://${webHostName}/apia/hello`, {
    headers: {
      Cookie: `loggedIn=true; token=${token}`
    }
  })
  expect(apiTestPageResponse.status).toEqual(200)
  expect(await apiTestPageResponse.text()).toEqual('{"username":"testuser","userId":"GHUser1234"}')
})

afterAll(async () => {
  await deleteFromSSMInTests({ appName: getAppName() }, SSM_PARAM_NAMES.TEST_COOKIE_SECRET)
})
