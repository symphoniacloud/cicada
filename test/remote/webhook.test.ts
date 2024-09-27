import { assert, expect, test } from 'vitest'
import { appStateForTests, lookupSSMParam } from './integrationTestSupport/cloudEnvironment'
import { SSM_PARAM_NAMES } from '../../src/multipleContexts/ssmParams'
import { randomUUID } from 'node:crypto'
import example_workflow_run from '../examples/github/org/webhook/workflowRunCompleted.json'
import { realS3 } from '../../src/app/outboundInterfaces/s3Wrapper'
import {
  deleteWorkflowRunActivityForAccount,
  getRunEventsForAccount
} from './integrationTestSupport/githubActivity'
import { sleep } from './integrationTestSupport/utils'
import { createSignatureHeader } from '../../src/app/domain/github/webhookProcessor/githubWebhookProcessor'

// GitHub Webhook - these are directly stored in S3, and then async processing occurs
test('webhook test', async () => {
  const appState = await appStateForTests()
  const apiHostName = await appState.config.webHostname()
  // Needs to be unique per test run since otherwise we'll be testing a previously saved version
  const deliveryId = `fake-integration-${randomUUID()}`
  const rawBody = JSON.stringify(example_workflow_run)
  const sigHeader = createSignatureHeader(rawBody, (await appState.config.github()).webhookSecret)
  const testAccountId = `${example_workflow_run.organization.id}`
  // Delete previous activity
  await deleteWorkflowRunActivityForAccount(appState, testAccountId)

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
        'X-GitHub-Event': 'workflow_run',
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
    'X-GitHub-Event': 'workflow_run',
    'X-Hub-Signature-256': sigHeader,
    body: rawBody
  })

  // 5 - Wait for async processing, and check correctly stored in database
  for (let i = 0; i < 11; i++) {
    if (i === 10) {
      assert.fail('Test failed - never found run events')
    }
    await sleep(1000)

    const runEvents = await getRunEventsForAccount(appState, testAccountId)
    if (runEvents.length > 0) {
      expect(runEvents[0]).toEqual({
        actor: {
          avatarUrl: 'https://avatars.githubusercontent.com/u/49635?v=4',
          htmlUrl: 'https://github.com/mikebroberts',
          id: 49635,
          login: 'mikebroberts'
        },
        conclusion: 'success',
        createdAt: '2024-03-06T19:25:32Z',
        displayTitle: 'Test Repo One Workflow',
        event: 'workflow_dispatch',
        headBranch: 'main',
        headSha: '8c3aa1cb0316ea23abeb2612457edb80868f53c8',
        htmlUrl: 'https://github.com/cicada-test-org/org-test-repo-one/actions/runs/8177622236',
        id: 8177622236,
        accountId: 162483619,
        accountName: 'cicada-test-org',
        accountType: 'organization',
        path: '.github/workflows/test.yml',
        repoHtmlUrl: 'https://github.com/cicada-test-org/org-test-repo-one',
        repoId: 768206479,
        repoName: 'org-test-repo-one',
        runAttempt: 1,
        runNumber: 3,
        runStartedAt: '2024-03-06T19:25:32Z',
        status: 'completed',
        updatedAt: '2024-03-06T19:25:42Z',
        workflowId: 88647110,
        workflowName: 'Test Repo One Workflow'
      })
      break
    }
  }
})
