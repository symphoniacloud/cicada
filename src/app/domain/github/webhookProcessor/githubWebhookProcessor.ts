import { AppState } from '../../../environment/AppState.js'
import {
  INSTALLATION_WEBHOOK_TYPE,
  PUSH_WEBHOOK_TYPE,
  WebhookType,
  WORKFLOW_RUN_WEBHOOK_TYPE
} from './webhookTypes.js'
import { logger } from '../../../util/logging.js'
import crypto from 'node:crypto'
import { githubWebhookInstallationProcessor } from './processors/githubWebhookInstallationProcessor.js'
import { WebhookProcessor } from './WebhookProcessor.js'
import { githubWebhookRepoPushProcessor } from './processors/githubWebhookRepoPushProcessor.js'
import { githubWebhookWorkflowRunProcessor } from './processors/githubWebhookWorkflowRunProcessor.js'
import { EventBridgeEvent } from 'aws-lambda'
import { GitHubWebhookStoredRunEvent } from '../../../ioTypes/RawGitHubSchemas.js'

export interface S3EventDetail {
  bucket: {
    name: string
  }
  object: {
    key: string
  }
}

// TODO - validate actual EventBridgeEvent structure
export async function processWebhookFromS3Event(
  appState: AppState,
  event: EventBridgeEvent<string, S3EventDetail>
) {
  try {
    await processWebhookFromS3EventAndThrow(appState, event)
  } catch (e) {
    logger.error(`Error attempting to process webhook event from s3: ${JSON.stringify(event)}`, e as Error)
  }
}

const processors: Record<WebhookType, WebhookProcessor> = {
  [INSTALLATION_WEBHOOK_TYPE]: githubWebhookInstallationProcessor,
  [PUSH_WEBHOOK_TYPE]: githubWebhookRepoPushProcessor,
  [WORKFLOW_RUN_WEBHOOK_TYPE]: githubWebhookWorkflowRunProcessor
}

async function processWebhookFromS3EventAndThrow(
  appState: AppState,
  event: EventBridgeEvent<string, S3EventDetail>
) {
  const webhookSecret = (await appState.config.github()).webhookSecret

  const rawContent = await appState.s3.getObjectAsString(event.detail.bucket.name, event.detail.object.key)
  const parsedContent = GitHubWebhookStoredRunEvent.safeParse(rawContent)
  if (!parsedContent.success) {
    logger.warn(`Unable to parse webhook content from S3`)
    return
  }

  const rawBody = parsedContent.data.body
  if (!validateWebhookSignature(parsedContent.data['X-Hub-Signature-256'], rawBody, webhookSecret)) {
    logger.warn('Invalid signature - not processing webhook')
    return
  }

  await processors[parsedContent.data['X-GitHub-Event']](appState, rawBody)
  logger.info('Finished processing webhook event')
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
