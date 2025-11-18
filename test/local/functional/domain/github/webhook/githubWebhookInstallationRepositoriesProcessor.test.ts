import { expect, test } from 'vitest'
import { FakeAppState } from '../../../../../testSupport/fakes/fakeAppState.js'
import { githubWebhookInstallationRepositoriesProcessor } from '../../../../../../src/app/domain/github/webhookProcessor/processors/githubWebhookInstallationRepositoriesProcessor.js'

import example_installation_repositories_added from '../../../../../examples/github/org/webhook/installation_repositories.added.json' with { type: 'json' }

import { fromRawGithubAppId } from '../../../../../../src/app/domain/github/mappings/toFromRawGitHubIds.js'

test('installation-repositories-added', async () => {
  // Arrange
  const appState = new FakeAppState()
  appState.config.fakeGithubConfig = {
    ...appState.config.fakeGithubConfig,
    appId: fromRawGithubAppId(2275019)
  }

  // Act
  await githubWebhookInstallationRepositoriesProcessor(
    appState,
    JSON.stringify(example_installation_repositories_added)
  )

  // Assert
  expect(appState.eventBridgeBus.sentEvents.length).toEqual(1)
  expect(appState.eventBridgeBus.sentEvents[0]).toEqual({
    detailType: 'InstallationRequiresCrawling',
    detail:
      '{"data":{"installation":{"installationId":"GHInstallation94224838","appId":"GHApp2275019","appSlug":"cicada-mike","accountName":"symphoniacloud","accountId":"GHAccount23423383","accountType":"organization"},"lookbackDays":2}}'
  })
})
