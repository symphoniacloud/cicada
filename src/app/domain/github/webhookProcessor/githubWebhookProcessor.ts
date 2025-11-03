import { AppState } from '../../../environment/AppState.js'
import { logger } from '../../../util/logging.js'
import crypto from 'node:crypto'
import { githubWebhookInstallationProcessor } from './processors/githubWebhookInstallationProcessor.js'
import { IGNORE_WEBHOOK_EVENT_PROCESSOR, WebhookProcessor } from './WebhookProcessor.js'
import { githubWebhookRepoPushProcessor } from './processors/githubWebhookRepoPushProcessor.js'
import { githubWebhookWorkflowRunProcessor } from './processors/githubWebhookWorkflowRunProcessor.js'
import { EventBridgeEvent } from 'aws-lambda'

import { StoredGitHubWebhookEvent, WebhookType } from '../../../ioTypes/GitHubWebhookSchemas.js'
import { emptySuccess, failedWith, isFailure } from '../../../util/structuredResult.js'

export interface S3EventDetail {
  bucket: {
    name: string
  }
  object: {
    key: string
  }
}

// TODO - validate actual EventBridgeEvent structure
export async function processGitHubWebhookFromS3Event(
  appState: AppState,
  event: EventBridgeEvent<string, S3EventDetail>
) {
  try {
    const result = await processGitHubWebhookFromS3EventAndThrow(appState, event)
    if (isFailure(result)) {
      logger.warn(result.reason)
    }
  } catch (e) {
    logger.error(`Error attempting to process webhook event from s3: ${JSON.stringify(event)}`, e as Error)
  }
}

const processors: Record<WebhookType, WebhookProcessor> = {
  installation: githubWebhookInstallationProcessor,
  push: githubWebhookRepoPushProcessor,
  workflow_run: githubWebhookWorkflowRunProcessor,
  meta: IGNORE_WEBHOOK_EVENT_PROCESSOR,
  organization: IGNORE_WEBHOOK_EVENT_PROCESSOR,
  repository: IGNORE_WEBHOOK_EVENT_PROCESSOR,
  workflow_job: IGNORE_WEBHOOK_EVENT_PROCESSOR
}

async function processGitHubWebhookFromS3EventAndThrow(
  appState: AppState,
  event: EventBridgeEvent<string, S3EventDetail>
) {
  const webhookSecret = (await appState.config.github()).webhookSecret

  const bucketName = event.detail.bucket.name
  const bucketKey = event.detail.object.key
  const rawContent = await appState.s3.getObjectAsString(bucketName, bucketKey)
  const parsedContent = StoredGitHubWebhookEvent.safeParse(rawContent)
  if (!parsedContent.success) {
    return failedWith(`Unable to parse webhook content from S3 at s3://${bucketName}/${bucketKey}`)
  }

  const rawBody = parsedContent.data.body
  if (!validateWebhookSignature(parsedContent.data['X-Hub-Signature-256'], rawBody, webhookSecret)) {
    return failedWith('Invalid signature - not processing webhook')
  }

  await processors[parsedContent.data['X-GitHub-Event']](appState, rawBody)
  logger.info('Finished processing webhook event')
  return emptySuccess
}

export function validateWebhookSignature(sigHeader: string, rawBody: string, webhookSecret: string) {
  return crypto.timingSafeEqual(
    Buffer.from(createSignatureHeader(rawBody, webhookSecret), 'ascii'),
    Buffer.from(sigHeader, 'ascii')
  )
}

export function createSignatureHeader(rawBody: string, webhookSecret: string) {
  return `sha256=${crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody ?? '')
    .digest('hex')}`
}
