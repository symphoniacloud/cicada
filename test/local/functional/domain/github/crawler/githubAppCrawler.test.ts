import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState'
import { crawlGithubApp } from '../../../../../../src/app/domain/github/crawler/githubAppCrawler'
import {
  testOrgInstallation,
  testPersonalInstallation
} from '../../../../../examples/cicada/githubDomainObjects'
import example_personal_account_installation from '../../../../../examples/github/personal-account/api/installation.json'
import example_org_installation from '../../../../../examples/github/org/api/installation.json'

test('app-crawler-for-personal-account-installation', async () => {
  // A
  const appState = new FakeAppState()
  appState.config.fakeGithubConfig = {
    ...appState.config.fakeGithubConfig,
    appId: '849936'
  }
  appState.githubClient.stubInstallations = [example_personal_account_installation]

  // A
  await crawlGithubApp(appState, { crawlChildObjects: 'never', lookbackDays: 7 })

  // A
  expect(appState.dynamoDB.puts.length).toEqual(1)
  expect(appState.dynamoDB.puts[0]).toEqual({
    Item: {
      PK: 'ACCOUNT#162360409',
      _et: 'githubInstallation',
      _lastUpdated: '2024-02-02T19:00:00.000Z',
      ...testPersonalInstallation
    },
    TableName: 'fakeGithubInstallationsTable'
  })
})

test('app-crawler-for-org-installation', async () => {
  // A
  const appState = new FakeAppState()
  appState.config.fakeGithubConfig = {
    ...appState.config.fakeGithubConfig,
    appId: '850768'
  }
  appState.githubClient.stubInstallations = [example_org_installation]

  // A
  await crawlGithubApp(appState, { crawlChildObjects: 'never', lookbackDays: 7 })

  // A
  expect(appState.dynamoDB.puts.length).toEqual(1)
  expect(appState.dynamoDB.puts[0]).toEqual({
    Item: {
      PK: 'ACCOUNT#162483619',
      _et: 'githubInstallation',
      _lastUpdated: '2024-02-02T19:00:00.000Z',
      ...testOrgInstallation
    },
    TableName: 'fakeGithubInstallationsTable'
  })
})
