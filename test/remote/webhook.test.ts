import { assert, expect, test } from 'vitest'
import { appStateForTests, lookupSSMParam } from './integrationTestSupport/cloudEnvironment.js'
import { SSM_PARAM_NAMES } from '../../src/multipleContexts/ssmParams.js'
import { randomUUID } from 'node:crypto'
import push from '../examples/github/org/webhook/push.json' with { type: 'json' }
import { realS3 } from '../../src/app/outboundInterfaces/s3Wrapper.js'
import { deletePushesForAccount, getPushesForAccount } from './integrationTestSupport/githubActivity.js'
import { sleep } from './integrationTestSupport/utils.js'
import { createSignatureHeader } from '../../src/app/domain/github/webhookProcessor/githubWebhookProcessor.js'

import { fromRawGitHubAccountId } from '../../src/app/domain/types/toFromRawGitHubIds.js'

// GitHub Webhook - these are directly stored in S3, and then async processing occurs
test('webhook test', async () => {
  const appState = await appStateForTests()
  const apiHostName = await appState.config.webHostname()
  // Needs to be unique per test run since otherwise we'll be testing a previously saved version
  const deliveryId = `fake-integration-${randomUUID()}`
  const rawBody = JSON.stringify(push)
  const sigHeader = createSignatureHeader(rawBody, (await appState.config.github()).webhookSecret)
  const testAccountId = fromRawGitHubAccountId(`${push.organization.id}`)
  // Delete previous activity
  await deletePushesForAccount(appState, testAccountId)

  // 1 - Make actual webhook call to Cicada API
  const webhookResponse = await fetch(
    // Webhook path contains a generated random string generated during deployment
    `https://${apiHostName}/github/webhook/${await lookupSSMParam(SSM_PARAM_NAMES.GITHUB_WEBHOOK_URL_CODE)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
        // Used by our API Gateway Configuration to generate path of target S3 object
        'X-GitHub-Delivery': deliveryId,
        // These two fields are parsed during API Gateway processing and included in target object
        // So that Lambda function which processes webhooks will ignore this event
        'X-GitHub-Event': 'push',
        // We use a real signature header here - this will be processed by triggered Lambda function
        'X-Hub-Signature-256': sigHeader
      },
      body: rawBody
    }
  )

  // 2 - Check 200 response - that's all we care about from API
  expect(webhookResponse.status).toEqual(200)

  // 3 - Now go find the generated object in S3
  const itemKey = `githubWebhook/${deliveryId}.json`
  const s3Content = await realS3().getObjectAsString(
    await lookupSSMParam(SSM_PARAM_NAMES.EVENTS_BUCKET_NAME),
    itemKey
  )

  // 4 - Validate content of object - should match original API request
  const parsedContent = JSON.parse(s3Content)
  expect(parsedContent).toEqual({
    'X-GitHub-Event': 'push',
    'X-Hub-Signature-256': sigHeader,
    body: rawBody
  })

  // 5 - Wait for async processing, and check correctly stored in database
  for (let i = 0; i < 11; i++) {
    if (i === 10) {
      assert.fail('Test failed - never found run events')
    }
    await sleep(1000)

    const pushes = await getPushesForAccount(appState, testAccountId)
    if (pushes.length > 0) {
      expect(pushes[0]).toEqual({
        accountId: 'GHAccount162483619',
        accountName: 'cicada-test-org',
        accountType: 'organization',
        actor: {
          avatarUrl: 'https://avatars.githubusercontent.com/u/49635?v=4',
          userId: 'GHUser49635',
          userName: 'mikebroberts'
        },
        before: '8c3aa1cb0316ea23abeb2612457edb80868f53c8',
        commits: [
          {
            author: {
              email: 'mike@symphonia.io',
              name: 'Mike Roberts'
            },
            distinct: true,
            message: 'Update README.md',
            sha: 'fc94eb2b6feab026673ee6e740f3dd7fafd7c130'
          }
        ],
        dateTime: '2024-03-06T21:26:18.000Z',
        ref: 'refs/heads/main',
        repoId: 'GHRepo768206479',
        repoName: 'org-test-repo-one',
        repoUrl: 'https://github.com/cicada-test-org/org-test-repo-one'
      })
      break
    }
  }
})
