import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState'
import { githubWebhookInstallationProcessor } from '../../../../../../src/app/domain/github/webhookProcessor/processors/githubWebhookInstallationProcessor'

import example_installation_created from '../../../../../examples/github/org/webhook/installationCreated.json'
import { testOrgInstallation } from '../../../../../examples/cicada/githubDomainObjects'

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
  expect(appState.eventBridgeBus.sentEvents.length).toEqual(1)
  expect(appState.eventBridgeBus.sentEvents[0]).toEqual({
    detailType: 'InstallationUpdated',
    detail:
      '{"data":{"installationId":48133709,"appId":850768,"appSlug":"cicada-test-org","accountLogin":"cicada-test-org","accountId":162483619,"accountType":"organization"}}'
  })
})
