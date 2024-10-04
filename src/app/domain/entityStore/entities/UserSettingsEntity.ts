import { AllEntitiesStore, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { USER_SETTINGS } from '../entityTypes'
import { isUserSettings, PersistedUserSettings } from '../../types/UserSettings'
import { cicadaEntityFromPkOnlyEntity } from '../entityStoreEntitySupport'
import { GithubUserId } from '../../types/GithubUserId'

const UserSettingsEntity = cicadaEntityFromPkOnlyEntity({
  type: USER_SETTINGS,
  parse: typePredicateParser(isUserSettings, USER_SETTINGS),
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

export async function getUserSettings(entityStore: AllEntitiesStore, userId: GithubUserId) {
  return store(entityStore).getOrUndefined({ userId })
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(UserSettingsEntity)
}
