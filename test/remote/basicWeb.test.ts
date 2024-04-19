import { expect, test } from 'vitest'
import { appStateForTests } from './integrationTestSupport/cloudEnvironment'

test('basic web test', async () => {
  // const cicadaConfig = lookupCicadaConfig()
  const appState = await appStateForTests()
  const webHostName = await appState.config.webHostname()
  const githubConfig = await appState.config.github()

  // Lookup home page - make sure basic web deployment is working
  const homePageResponse = await fetch(`https://${webHostName}`)
  const homePageBody = await homePageResponse.text()
  expect(homePageBody).toContain('Welcome to Cicada')

  // Call login - make sure basic API Lambda is working
  const loginResponse = await fetch(`https://${webHostName}/auth/github/login`, {
    redirect: 'manual'
  })
  expect(loginResponse.status).toEqual(302)
  expect(loginResponse.headers.get('Location')).toEqual(
    `https://github.com/login/oauth/authorize?client_id=${githubConfig.clientId}&redirect_uri=https://${webHostName}/auth/github/callback&scope=user:email&state=${githubConfig.githubCallbackState}`
  )
})
