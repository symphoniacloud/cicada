import { EventBridgeBus } from '../../../src/app/outboundInterfaces/eventBridgeBus.js'

export interface SentEvent {
  detailType: string
  detail: string
}

export class FakeEventBridgeBus implements EventBridgeBus {
  public sentEvents: SentEvent[] = []

  async sendEvent(detailType: string, detail: string): Promise<void> {
    this.sentEvents.push({ detailType, detail })
  }
}
