import { MultipleEntityCollectionResponse } from '@symphoniacloud/dynamodb-entity-store'
import { EntityType } from './entityTypes.js'

// I use a conditional check on certain operations knowing that they might fail during regular behavior
// Unfortunately the underlying DynamoDB SDK will always throw an error, so this code catches that error to provide
// a cleaner experience in code making such operations.
export async function executeAndCatchConditionalCheckFailed<TReturn>(f: () => Promise<TReturn>) {
  try {
    return await f()
  } catch (e) {
    // TOEventually - nicer way of doing this in typescript
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (e?.name === 'ConditionalCheckFailedException') {
      return undefined
    } else {
      throw e
    }
  }
}

// TOMaybe - nicer way of doing this without the type cast?
export function domainObjectsFromMultipleEventEntityResponse<T>(
  multipleEntityReponse: MultipleEntityCollectionResponse,
  entityType: EntityType
): T[] {
  return (multipleEntityReponse.itemsByEntityType[entityType] as T[]) ?? []
}
