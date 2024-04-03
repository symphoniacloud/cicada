import { AppState } from '../../../environment/AppState'
import {
  INSTALLATION_WEBHOOK_TYPE,
  isWebhookType,
  PUSH_WEBHOOK_TYPE,
  WebhookType,
  WORKFLOW_RUN_WEBHOOK_TYPE
} from './webhookTypes'
import { logger } from '../../../util/logging'
import crypto from 'crypto'
import { githubWebhookInstallationProcessor } from './processors/githubWebhookInstallationProcessor'
import { WebhookProcessor } from './WebhookProcessor'
import { githubWebhookRepoPushProcessor } from './processors/githubWebhookRepoPushProcessor'
import { githubWebhookWorkflowRunProcessor } from './processors/githubWebhookWorkflowRunProcessor'
import { EventBridgeEvent } from 'aws-lambda'

export interface S3EventDetail {
  bucket: {
    name: string
  }
  object: {
    key: string
  }
}

export async function processWebhookFromS3Event(
  appState: AppState,
  event: EventBridgeEvent<string, S3EventDetail>
) {
  try {
    await processWebhook(
      appState,
      await appState.s3.getObjectAsString(event.detail.bucket.name, event.detail.object.key)
    )
  } catch (e) {
    logger.error(`Error attempting to process webhook event from s3: ${JSON.stringify(event)}`, e as Error)
  }
}

export async function processWebhook(appState: AppState, rawContent: string) {
  const parsed = parseGithubWebhookContent(rawContent, (await appState.config.github()).webhookSecret)
  if (!parsed) return
  await processors[parsed.eventType](appState, parsed.rawBody)
  logger.info('Finished processing webhook event')
}

const processors: Record<WebhookType, WebhookProcessor> = {
  [INSTALLATION_WEBHOOK_TYPE]: githubWebhookInstallationProcessor,
  [PUSH_WEBHOOK_TYPE]: githubWebhookRepoPushProcessor,
  [WORKFLOW_RUN_WEBHOOK_TYPE]: githubWebhookWorkflowRunProcessor
}

function parseGithubWebhookContent(rawContent: string, webhookSecret: string) {
  const content = getContentFields(rawContent)
  if (!content) return

  const { sigHeader, eventType, rawBody } = content

  if (!validateWebhook(sigHeader, rawBody, webhookSecret)) {
    logger.warn('Invalid signature - not processing webhook')
    return
  }
  logger.debug('Webhook validation successful')

  if (!isWebhookType(eventType)) {
    logger.info(`Ignoring event of type ${eventType}`)
    return
  }
  logger.debug(`Identified event of type ${eventType}`)

  return { rawBody, eventType }
}

function getContentFields(content: string) {
  const s3ObjectContent = JSON.parse(content)

  const sigHeader = s3ObjectContent['X-Hub-Signature-256']
  if (!sigHeader || sigHeader.length === 0) {
    logger.warn('No X-Hub-Signature-256 field - aborting')
    return
  }

  const eventType = s3ObjectContent['X-GitHub-Event']
  if (!eventType || eventType.length === 0) {
    logger.warn('No X-GitHub-Event field - aborting')
    return
  }

  const rawBody = s3ObjectContent.body ?? ''
  if (!rawBody || rawBody.length === 0) {
    logger.warn('No body field - aborting')
    return
  }

  return { sigHeader, eventType, rawBody }
}

export function validateWebhook(sigHeader: string, rawBody: string, webhookSecret: string) {
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
