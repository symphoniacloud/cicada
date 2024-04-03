/* eslint-disable @typescript-eslint/no-unused-vars */

import { AppState } from '../../../src/app/environment/AppState'
import { FakeClock } from './fakeClock'
import { FakeGithubClient } from './fakeGithubClient'
import { FakeDynamoDBInterface } from './fakeDynamoDBInterface'
import { setupEntityStore } from '../../../src/app/domain/entityStore/initEntityStore'
import { AllEntitiesStore, EntityStoreLogger } from '@symphoniacloud/dynamodb-entity-store'
import { FakeCicadaConfig } from './fakeCicadaConfig'
import { FakeS3Wrapper } from './fakeS3Wrapper'
import { FakeEventBridgeBus } from './fakeEventBridgeBus'
import { FakeWebPushWrapper } from './fakeWebPushWrapper'

export class FakeAppState implements AppState {
  public config: FakeCicadaConfig
  public clock: FakeClock
  public githubClient: FakeGithubClient
  public dynamoDB: FakeDynamoDBInterface
  public entityStore: AllEntitiesStore
  public eventBridgeBus: FakeEventBridgeBus
  public s3: FakeS3Wrapper
  public webPushWrapper: FakeWebPushWrapper

  constructor(
    options: { entityStoreLogger: EntityStoreLogger } = { entityStoreLogger: silentEntityStoreLogger }
  ) {
    this.config = new FakeCicadaConfig()
    this.clock = new FakeClock()
    this.githubClient = new FakeGithubClient()
    this.dynamoDB = new FakeDynamoDBInterface()
    this.entityStore = setupEntityStore(
      this.config.fakeTableNames,
      this.clock,
      options.entityStoreLogger,
      this.dynamoDB
    )
    this.eventBridgeBus = new FakeEventBridgeBus()
    this.s3 = new FakeS3Wrapper()
    this.webPushWrapper = new FakeWebPushWrapper()
  }
}

export const silentEntityStoreLogger: EntityStoreLogger = {
  debug(): void {
    // No-op
  },
  getLevelName(): Uppercase<string> {
    return 'INFO'
  }
}
