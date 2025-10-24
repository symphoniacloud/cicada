import { AllEntitiesStore, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GithubUser, isGithubUser } from '../../types/GithubUser.js'
import { GITHUB_USER } from '../entityTypes.js'
import { cicadaEntityFromPkOnlyEntity } from '../entityStoreEntitySupport.js'

import { GitHubUserId } from '../../../types/GitHubTypes.js'

const GithubUserEntity = cicadaEntityFromPkOnlyEntity({
  type: GITHUB_USER,
  parse: typePredicateParser(isGithubUser, GITHUB_USER),
  pk(source: Pick<GithubUser, 'userId'>) {
    return `USER#${source.userId}`
  }
})

export async function batchPutUsers(entityStore: AllEntitiesStore, users: GithubUser[]) {
  await store(entityStore).advancedOperations.batchPut(users)
}

export async function getUserById(
  entityStore: AllEntitiesStore,
  userId: GitHubUserId
): Promise<GithubUser | undefined> {
  return store(entityStore).getOrUndefined({ userId })
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubUserEntity)
}
