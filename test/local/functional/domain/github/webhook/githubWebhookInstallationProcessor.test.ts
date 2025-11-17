import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState.js'
import { githubWebhookInstallationProcessor } from '../../../../../../src/app/domain/github/webhookProcessor/processors/githubWebhookInstallationProcessor.js'

import example_installation_created from '../../../../../examples/github/org/webhook/installationCreated.json' with { type: 'json' }
import { cicadaTestOrgInstallation } from '../../../../../examples/cicada/githubDomainObjects.js'
import { buildGitHubInstallationItem } from '../../../../../testSupport/builders/dynamoDBItemBuilders.js'

import { fromRawGithubAppId } from '../../../../../../src/app/domain/github/mappings/toFromRawGitHubIds.js'
import { fakeTableNames } from '../../../../../testSupport/fakes/fakeCicadaConfig.js'

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
  expect(appState.dynamoDB.getAllFromTable(fakeTableNames['github-installations'])).toEqual([
    buildGitHubInstallationItem(cicadaTestOrgInstallation)
  ])
  expect(appState.eventBridgeBus.sentEvents.length).toEqual(1)
  expect(appState.eventBridgeBus.sentEvents[0]).toEqual({
    detailType: 'InstallationRequiresCrawling',
    detail:
      '{"data":{"installation":{"installationId":"GHInstallation48133709","appId":"GHApp850768","appSlug":"cicada-test-org","accountName":"cicada-test-org","accountId":"GHAccount162483619","accountType":"organization"},"lookbackDays":30}}'
  })
})
