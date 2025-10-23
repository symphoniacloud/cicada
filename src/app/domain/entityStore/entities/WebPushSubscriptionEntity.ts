import { WEB_PUSH_SUBSCRIPTION } from '../entityTypes.js'
import { isWebPushSubscription, WebPushSubscription } from '../../types/WebPushSubscription.js'
import { AllEntitiesStore, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { CicadaEntity } from '../entityStoreEntitySupport.js'

import { GitHubUserId } from '../../../types/GitHubIdTypes.js'

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
  userId: GitHubUserId,
  endpoint: string
) {
  await store(entityStore).delete({ userId, endpoint })
}

export async function getAllWebPushSubscriptionsForUser(entityStore: AllEntitiesStore, userId: GitHubUserId) {
  return await store(entityStore).queryAllByPk({ userId })
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(WebPushSubscriptionEntity)
}
