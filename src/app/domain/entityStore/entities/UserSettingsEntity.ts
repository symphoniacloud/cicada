import { entityFromPkOnlyEntity, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { USER_SETTINGS } from '../entityTypes'
import { isUserSettings, PersistedUserSettings } from '../../types/UserSettings'

export const UserSettingsEntity = entityFromPkOnlyEntity({
  type: USER_SETTINGS,
  parse: typePredicateParser(isUserSettings, USER_SETTINGS),
  pk(source: Pick<PersistedUserSettings, 'userId'>) {
    return `USERID#${source.userId}`
  }
})
