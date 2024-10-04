import { typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { USER_SETTINGS } from '../entityTypes'
import { isUserSettings, PersistedUserSettings } from '../../types/UserSettings'
import { cicadaEntityFromPkOnlyEntity } from '../entityStoreEntitySupport'

export const UserSettingsEntity = cicadaEntityFromPkOnlyEntity({
  type: USER_SETTINGS,
  parse: typePredicateParser(isUserSettings, USER_SETTINGS),
  pk(source: Pick<PersistedUserSettings, 'userId'>) {
    return `USERID#${source.userId}`
  }
})
