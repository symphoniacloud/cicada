import { AllEntitiesStore, DynamoDBValues } from '@symphoniacloud/dynamodb-entity-store'
import { USER_SETTINGS } from '../entityTypes.js'
import {
  PersistedUserSettings,
  PersistedUserSettingsSchema
} from '../../../ioTypes/UserSettingsSchemasAndTypes.js'
import { cicadaEntityFromPkOnlyEntity } from '../entityStoreEntitySupport.js'

import { GitHubUserId } from '../../../ioTypes/GitHubTypes.js'

const UserSettingsEntity = cicadaEntityFromPkOnlyEntity({
  type: USER_SETTINGS,
  parse: (rawItem: DynamoDBValues) => PersistedUserSettingsSchema.parse(rawItem),
  pk(source: Pick<PersistedUserSettings, 'userId'>) {
    return `USERID#${source.userId}`
  }
})

export async function saveUserSettings(
  entityStore: AllEntitiesStore,
  userSettings: PersistedUserSettings
): Promise<PersistedUserSettings> {
  return store(entityStore).put(userSettings)
}

export async function getUserSettings(entityStore: AllEntitiesStore, userId: GitHubUserId) {
  return store(entityStore).getOrUndefined({ userId })
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(UserSettingsEntity)
}
