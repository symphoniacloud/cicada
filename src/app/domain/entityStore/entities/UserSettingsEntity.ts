import { entityFromPkOnlyEntity } from '@symphoniacloud/dynamodb-entity-store'
import { USER_SETTINGS } from '../entityTypes'
import { PersistedUserSettings } from '../../types/UserSettings'
import { DynamoDBValues } from '@symphoniacloud/dynamodb-entity-store/dist/cjs/entities'
import { parseDynamoDBDictToMap } from '../entityStoreEntitySupport'
import { identity } from '../../../util/functional'

export function parseUserSettings(item: DynamoDBValues): PersistedUserSettings {
  // TODO - check things actually exist
  return {
    userId: item.userId,
    github: {
      accounts: parseDynamoDBDictToMap(
        Number.parseInt,
        (value) => ({
          ...value,
          repos: parseDynamoDBDictToMap(
            Number.parseInt,
            (value) => ({
              ...value,
              workflows: parseDynamoDBDictToMap(Number.parseInt, identity, value.workflows ?? {})
            }),
            value.repos ?? {}
          )
        }),
        item.github.accounts
      )
    }
  }
}

export const UserSettingsEntity = entityFromPkOnlyEntity({
  type: USER_SETTINGS,
  parse: parseUserSettings,
  pk(source: Pick<PersistedUserSettings, 'userId'>) {
    return `USERID#${source.userId}`
  }
})
