/* eslint-disable @typescript-eslint/no-unused-vars */

import { AppState } from '../../../src/app/environment/AppState.js'
import { FakeClock } from './fakeClock.js'
import { FakeGithubClient } from './fakeGithubClient.js'
import { FakeDynamoDBInterface } from './dynamoDB/fakeDynamoDBInterface.js'
import { setupEntityStore } from '../../../src/app/domain/entityStore/initEntityStore.js'
import { AllEntitiesStore, consoleLogger, EntityStoreLogger } from '@symphoniacloud/dynamodb-entity-store'
import { FakeCicadaConfig, fakeTableNames } from './fakeCicadaConfig.js'
import { FakeS3Wrapper } from './fakeS3Wrapper.js'
import { FakeEventBridgeBus } from './fakeEventBridgeBus.js'
import { FakeWebPushWrapper } from './fakeWebPushWrapper.js'

export class FakeAppState implements AppState {
  public config: FakeCicadaConfig
  public clock: FakeClock
  public githubClient: FakeGithubClient
  public dynamoDB: FakeDynamoDBInterface
  public entityStore: AllEntitiesStore
  public eventBridgeBus: FakeEventBridgeBus
  public s3: FakeS3Wrapper
  public webPushWrapper: FakeWebPushWrapper

  constructor(options: { useConsoleLogger?: boolean } = {}) {
    this.config = new FakeCicadaConfig()
    this.clock = new FakeClock()
    this.githubClient = new FakeGithubClient()
    this.dynamoDB = new FakeDynamoDBInterface()
    this.entityStore = setupEntityStore(
      fakeTableNames,
      this.clock,
      pickLogger(options.useConsoleLogger),
      this.dynamoDB
    )
    this.eventBridgeBus = new FakeEventBridgeBus()
    this.s3 = new FakeS3Wrapper()
    this.webPushWrapper = new FakeWebPushWrapper()
  }
}

function pickLogger(useConsoleLogger = false) {
  return useConsoleLogger ? consoleLogger : silentEntityStoreLogger
}

export const silentEntityStoreLogger: EntityStoreLogger = {
  debug(): void {
    // No-op
  },
  getLevelName(): Uppercase<string> {
    return 'INFO'
  }
}
