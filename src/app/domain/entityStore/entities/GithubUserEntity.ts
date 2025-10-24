import { AllEntitiesStore, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GITHUB_USER } from '../entityTypes.js'
import { cicadaEntityFromPkOnlyEntity } from '../entityStoreEntitySupport.js'

import { GitHubUser, GitHubUserId } from '../../../types/GitHubTypes.js'
import { isGitHubUser } from '../../../types/GitHubTypeChecks.js'

const GithubUserEntity = cicadaEntityFromPkOnlyEntity({
  type: GITHUB_USER,
  parse: typePredicateParser(isGitHubUser, GITHUB_USER),
  pk(source: Pick<GitHubUser, 'userId'>) {
    return `USER#${source.userId}`
  }
})

export async function batchPutUsers(entityStore: AllEntitiesStore, users: GitHubUser[]) {
  await store(entityStore).advancedOperations.batchPut(users)
}

export async function getUserById(
  entityStore: AllEntitiesStore,
  userId: GitHubUserId
): Promise<GitHubUser | undefined> {
  return store(entityStore).getOrUndefined({ userId })
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubUserEntity)
}
