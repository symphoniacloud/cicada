import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge'
import { logger } from '../util/logging'
import { EventBridgeDetailType } from '../../multipleContexts/eventBridge'
import { tracer } from '../util/tracing'
import { AppState } from '../environment/AppState'
import { GithubPush } from '../domain/types/GithubPush'
import { GithubWorkflowRunEvent } from '../domain/types/GithubWorkflowRunEvent'
import { WebPushTestEvent } from '../domain/webPush/WebPushTestEvent'
import { GithubInstallation } from '../domain/types/GithubInstallation'
import { GithubAccountId } from '../domain/types/GithubKeys'

export type CicadaEventBridgeData =
  | GithubPush
  | GithubWorkflowRunEvent
  | WebPushTestEvent
  | GithubInstallation
  | { installation: GithubInstallation; publicAccountId: GithubAccountId }

// This exists since eventually would be nice to add metadata (see https://community.aws/posts/eventbridge-schema-registry-best-practices)
export interface CicadaEventBridgeDetail {
  data: CicadaEventBridgeData
}

export function isCicadaEventBridgeDetail(x: unknown): x is CicadaEventBridgeDetail {
  return (x as CicadaEventBridgeDetail).data !== undefined
}

export async function sendToEventBridge(
  withEventBridgeBus: Pick<AppState, 'eventBridgeBus'>,
  detailType: EventBridgeDetailType,
  data: CicadaEventBridgeData
) {
  const fullEvent: CicadaEventBridgeDetail = {
    data
  }
  await withEventBridgeBus.eventBridgeBus.sendEvent(detailType, JSON.stringify(fullEvent))
}

export interface EventBridgeBus {
  sendEvent(detailType: string, detail: string): Promise<void>
}

export function realEventBridgeEventBus(appName: string): EventBridgeBus {
  const eventBridgeClient = tracer.captureAWSv3Client(new EventBridgeClient({}))

  return {
    async sendEvent(detailType: EventBridgeDetailType, detail: string): Promise<void> {
      const entry = {
        Source: `${appName}`,
        DetailType: detailType,
        Detail: detail
      }

      logger.debug('Putting to EventBridge', { entry })

      const output = await eventBridgeClient.send(
        new PutEventsCommand({
          Entries: [entry]
        })
      )

      if (output.FailedEntryCount) {
        logger.error('EventBridgeBusPostEventError', {
          detail: `Some of the EventBridge entries failed, number of failed entries: ${output.FailedEntryCount}`
        })
        logger.info('error output', { output })
      }
    }
  }
}
