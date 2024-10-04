import { WEB_PUSH_SUBSCRIPTION } from '../entityTypes'
import { isWebPushSubscription, WebPushSubscription } from '../../types/WebPushSubscription'
import { AllEntitiesStore, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { CicadaEntity } from '../entityStoreEntitySupport'
import { GithubUserId } from '../../types/GithubUserId'

const WebPushSubscriptionEntity: CicadaEntity<
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

export async function putWebPushSubscription(
  entityStore: AllEntitiesStore,
  subscription: WebPushSubscription
) {
  return await store(entityStore).put(subscription)
}

export async function deleteWebPushSubscription(
  entityStore: AllEntitiesStore,
  userId: GithubUserId,
  endpoint: string
) {
  await store(entityStore).delete({ userId, endpoint })
}

export async function getAllWebPushSubscriptionsForUser(entityStore: AllEntitiesStore, userId: GithubUserId) {
  return await store(entityStore).queryAllByPk({ userId })
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(WebPushSubscriptionEntity)
}
