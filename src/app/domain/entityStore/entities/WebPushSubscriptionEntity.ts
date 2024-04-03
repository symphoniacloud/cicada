import { WEB_PUSH_SUBSCRIPTION } from '../entityTypes'
import { isWebPushSubscription, WebPushSubscription } from '../../types/WebPushSubscription'
import { Entity, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'

export const WebPushSubscriptionEntity: Entity<
  WebPushSubscription,
  Pick<WebPushSubscription, 'userId'>,
  Pick<WebPushSubscription, 'endpoint'>
> = {
  type: WEB_PUSH_SUBSCRIPTION,
  parse: typePredicateParser(isWebPushSubscription, WEB_PUSH_SUBSCRIPTION),
  pk(source: Pick<WebPushSubscription, 'userId'>) {
    return `USER#${source.userId}`
  },
  sk(source: Pick<WebPushSubscription, 'endpoint'>) {
    return `ENDPOINT#${source.endpoint}`
  }
}
