import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState'
import {
  cicadaTestOrgInstallation,
  cicadaTestUserInstallation
} from '../../../../../examples/cicada/githubDomainObjects'
import example_personal_account_installation from '../../../../../examples/github/personal-account/api/installation.json'
import example_org_installation from '../../../../../examples/github/org/api/installation.json'
import { crawlInstallations } from '../../../../../../src/app/domain/github/crawler/crawlInstallations'
import {
  expectPut,
  expectPutsLength
} from '../../../../../testSupport/fakes/dynamoDB/fakeDynamoDBInterfaceExpectations'
import { expectedPutGithubInstallation } from '../../../../../testSupport/fakes/tableRecordExpectedWrites'

import { fromRawGithubAppId } from '../../../../../../src/app/domain/types/GithubAppId'

test('app-crawler-for-personal-account-installation', async () => {
  // A
  const appState = new FakeAppState()
  appState.config.fakeGithubConfig = {
    ...appState.config.fakeGithubConfig,
    appId: fromRawGithubAppId(849936)
  }
  appState.githubClient.stubInstallations = [example_personal_account_installation]

  // A
  const result = await crawlInstallations(appState)

  // A
  expectPutsLength(appState).toEqual(1)
  expectPut(appState).toEqual(expectedPutGithubInstallation(cicadaTestUserInstallation))
  expect(result).toEqual([cicadaTestUserInstallation])
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
  const result = await crawlInstallations(appState)

  // A
  expectPutsLength(appState).toEqual(1)
  expectPut(appState).toEqual(expectedPutGithubInstallation(cicadaTestOrgInstallation))
  expect(result).toEqual([cicadaTestOrgInstallation])
})
