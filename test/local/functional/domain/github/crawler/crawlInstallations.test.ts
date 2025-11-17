import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState.js'
import {
  cicadaTestOrgInstallation,
  cicadaTestUserInstallation
} from '../../../../../examples/cicada/githubDomainObjects.js'
import example_personal_account_installation from '../../../../../examples/github/personal-account/api/installation.json' with { type: 'json' }
import example_org_installation from '../../../../../examples/github/org/api/installation.json' with { type: 'json' }
import { crawlInstallations } from '../../../../../../src/app/domain/github/crawler/crawlInstallations.js'
import { buildGitHubInstallationItem } from '../../../../../testSupport/fakes/itemBuilders.js'

import { fromRawGithubAppId } from '../../../../../../src/app/domain/github/mappings/toFromRawGitHubIds.js'
import { fakeTableNames } from '../../../../../testSupport/fakes/fakeCicadaConfig.js'

test('app-crawler-for-personal-account-installation', async () => {
  // A
  const appState = new FakeAppState()
  appState.config.fakeGithubConfig = {
    ...appState.config.fakeGithubConfig,
    appId: fromRawGithubAppId(849936)
  }
  appState.githubClient.stubInstallations = [example_personal_account_installation]

  // A
  await crawlInstallations(appState)

  // A
  expect(appState.dynamoDB.getAllFromTable(fakeTableNames['github-installations'])).toEqual([
    buildGitHubInstallationItem(cicadaTestUserInstallation)
  ])
})

test('app-crawler-for-org-installation', async () => {
  // A
  const appState = new FakeAppState()
  appState.config.fakeGithubConfig = {
    ...appState.config.fakeGithubConfig,
    appId: fromRawGithubAppId(850768)
  }
  appState.githubClient.stubInstallations = [example_org_installation]

  // A
  await crawlInstallations(appState)

  // A
  expect(appState.dynamoDB.getAllFromTable(fakeTableNames['github-installations'])).toEqual([
    buildGitHubInstallationItem(cicadaTestOrgInstallation)
  ])
})
