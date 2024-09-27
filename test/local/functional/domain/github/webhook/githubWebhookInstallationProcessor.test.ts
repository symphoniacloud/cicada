import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState'
import { githubWebhookInstallationProcessor } from '../../../../../../src/app/domain/github/webhookProcessor/processors/githubWebhookInstallationProcessor'

import example_installation_created from '../../../../../examples/github/org/webhook/installationCreated.json'
import { testOrgInstallation } from '../../../../../examples/cicada/githubDomainObjects'
import {
  expectPut,
  expectPutsLength
} from '../../../../../testSupport/fakes/dynamoDB/fakeDynamoDBInterfaceExpectations'
import { expectedPutGithubInstallation } from '../../../../../testSupport/fakes/tableRecordExpectedWrites'

test('installation-webhook-for-org-account-installation', async () => {
  // A
  const appState = new FakeAppState()
  appState.config.fakeGithubConfig = {
    ...appState.config.fakeGithubConfig,
    appId: '850768'
  }

  // A
  await githubWebhookInstallationProcessor(appState, JSON.stringify(example_installation_created))

  // A
  expectPutsLength(appState).toEqual(1)
  expectPut(appState).toEqual(expectedPutGithubInstallation(testOrgInstallation))
  expect(appState.eventBridgeBus.sentEvents.length).toEqual(1)
  expect(appState.eventBridgeBus.sentEvents[0]).toEqual({
    detailType: 'InstallationUpdated',
    detail:
      '{"data":{"installationId":48133709,"appId":850768,"appSlug":"cicada-test-org","accountLogin":"cicada-test-org","accountId":"162483619","accountType":"organization"}}'
  })
})
