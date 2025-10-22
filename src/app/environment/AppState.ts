import { Clock } from '../util/dateAndTime.js'
import { AllEntitiesStore } from '@symphoniacloud/dynamodb-entity-store'
import { GithubClient } from '../outboundInterfaces/githubClient.js'
import { WebPushWrapper } from '../outboundInterfaces/webPushWrapper.js'
import { EventBridgeBus } from '../outboundInterfaces/eventBridgeBus.js'
import { CicadaConfig } from './config.js'
import { S3Wrapper } from '../outboundInterfaces/s3Wrapper.js'

// AppState captures all side-effect related concepts, including integrations with databases, external services, etc.
// AppState is tracked as its own object for local-testing purposes, and to cache certain data across multiple
// application requests
// AppState is passed as an object to any code that needs it, rather than being set statically.
// Philosophically it works a little like Sandra Sierra's "component" model in Clojure (see https://github.com/stuartsierra/component)
// and/or like a manual / basic from of inversion-of-control (IoC) / Dependency Injection (DI) (see https://martinfowler.com/articles/injection.html)
// Each Lambda function initializes AppState during the first request and caches it for any subsequent requests
export interface AppState {
  readonly config: CicadaConfig
  readonly clock: Clock
  readonly githubClient: GithubClient
  readonly entityStore: AllEntitiesStore
  readonly eventBridgeBus: EventBridgeBus
  readonly s3: S3Wrapper
  readonly webPushWrapper: WebPushWrapper
}
