import { NativeAttributeValue } from '@aws-sdk/util-dynamodb/dist-types/models'
import { Entity, entityFromPkOnlyEntity, PKOnlyEntity } from '@symphoniacloud/dynamodb-entity-store'
import { EntityType } from './entityTypes'

export function parseDynamoDBDictToMap<TKey, TValue>(
  parseKey: (x: string) => TKey,
  parseValue: (x: NativeAttributeValue) => TValue,
  unparsed: { [key: string]: NativeAttributeValue }
): Map<TKey, TValue> {
  return new Map<TKey, TValue>(
    Object.entries(unparsed).map(([key, value]) => {
      return [parseKey(key), parseValue(value)]
    })
  )
}

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
