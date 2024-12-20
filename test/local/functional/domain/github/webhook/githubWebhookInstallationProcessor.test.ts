import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState'
import { githubWebhookInstallationProcessor } from '../../../../../../src/app/domain/github/webhookProcessor/processors/githubWebhookInstallationProcessor'

import example_installation_created from '../../../../../examples/github/org/webhook/installationCreated.json'
import { cicadaTestOrgInstallation } from '../../../../../examples/cicada/githubDomainObjects'
import {
  expectPut,
  expectPutsLength
} from '../../../../../testSupport/fakes/dynamoDB/fakeDynamoDBInterfaceExpectations'
import { expectedPutGithubInstallation } from '../../../../../testSupport/fakes/tableRecordExpectedWrites'

import { fromRawGithubAppId } from '../../../../../../src/app/domain/types/GithubAppId'

test('installation-webhook-for-org-account-installation', async () => {
  // A
  const appState = new FakeAppState()
  appState.config.fakeGithubConfig = {
    ...appState.config.fakeGithubConfig,
    appId: fromRawGithubAppId(850768)
  }

  // A
  await githubWebhookInstallationProcessor(appState, JSON.stringify(example_installation_created))

  // A
  expectPutsLength(appState).toEqual(1)
  expectPut(appState).toEqual(expectedPutGithubInstallation(cicadaTestOrgInstallation))
  expect(appState.eventBridgeBus.sentEvents.length).toEqual(1)
  expect(appState.eventBridgeBus.sentEvents[0]).toEqual({
    detailType: 'InstallationUpdated',
    detail:
      '{"data":{"installationId":"GHInstallation48133709","appId":"GHApp850768","appSlug":"cicada-test-org","accountName":"cicada-test-org","accountId":"GHAccount162483619","accountType":"organization"}}'
  })
})
