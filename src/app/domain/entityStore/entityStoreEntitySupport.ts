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
