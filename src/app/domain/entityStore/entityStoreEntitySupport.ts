import { Entity, entityFromPkOnlyEntity, PKOnlyEntity } from '@symphoniacloud/dynamodb-entity-store'
import { EntityType } from './entityTypes.js'

export interface CicadaEntity<TItem extends TPKSource & TSKSource, TPKSource, TSKSource>
  extends Entity<TItem, TPKSource, TSKSource> {
  type: EntityType
}

export interface CicadaPKOnlyEntity<TItem extends TPKSource, TPKSource>
  extends PKOnlyEntity<TItem, TPKSource> {
  type: EntityType
}

export function cicadaEntityFromPkOnlyEntity<TItem extends TPKSource, TPKSource>(
  pkOnlyEntity: CicadaPKOnlyEntity<TItem, TPKSource>
) {
  return entityFromPkOnlyEntity(pkOnlyEntity) as CicadaEntity<TItem, TPKSource, unknown>
}

// export function zodEntityParser<TItem extends DynamoDBValues>(
//   typePredicate: TypePredicateFunction<TItem>,
//   entityType: string
// ): EntityParser<TItem> {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   return (rawItem: DynamoDBValues, allMetaAttributeNames: string[]) => {
//     const item = excludeKeys(rawItem, allMetaAttributeNames)
//     if (typePredicate(item)) return item
//     else throw new Error(`Failed to parse entity to type ${entityType}`)
//   }
// }
