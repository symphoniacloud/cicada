import { AllEntitiesStore, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GithubPush, isGithubPush } from '../../types/GithubPush.js'
import { GITHUB_PUSH } from '../entityTypes.js'
import { latestCommitInPush } from '../../github/githubPush.js'
import { CicadaEntity } from '../entityStoreEntitySupport.js'
import { githubActivityEntityGSISk, githubActivityEntityPk } from './GithubWorkflowRunEntity.js'

import { GitHubAccountId } from '../../../types/GitHubTypes.js'

// Exported since also used by GithubWorkflowRunEntity
export const GithubPushEntity: CicadaEntity<
  GithubPush,
  Pick<GithubPush, 'accountId'>,
  Pick<GithubPush, 'repoId' | 'ref' | 'commits'>
> = {
  type: GITHUB_PUSH,
  parse: typePredicateParser(isGithubPush, GITHUB_PUSH),
  pk(source: Pick<GithubPush, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  },
  // Add #PUSH in case in the future we want some other kind of activity per ref
  sk(source: Pick<GithubPush, 'repoId' | 'ref' | 'commits'>) {
    return `REPO#${source.repoId}#REF#${source.ref}#PUSH#COMMIT#${latestCommitInPush(source).sha}`
  },
  gsis: {
    // Shared format with GithubWorkflowRunEventEntity and GithubPushEntity
    // Allows querying multiple entity types in one query operation
    gsi1: {
      pk(source: Pick<GithubPush, 'accountId'>) {
        return githubActivityEntityPk(source)
      },
      sk(source: Pick<GithubPush, 'repoId' | 'dateTime'>) {
        return githubActivityEntityGSISk(source.repoId, source.dateTime)
      }
    }
  }
}

export async function putPushIfNoKeyExists(entityStore: AllEntitiesStore, push: GithubPush) {
  return await store(entityStore).put(push, {
    conditionExpression: 'attribute_not_exists(PK)'
  })
}

// CAREFUL - Don't use this for production code! Only just used for integration tests
export async function onlyUseInTestsGetAllGithubPushesForAccount(
  entityStore: AllEntitiesStore,
  accountId: GitHubAccountId
) {
  return store(entityStore).queryAllByPk({ accountId })
}

// Used in integration tests
export async function batchDeleteGithubPushes(entityStore: AllEntitiesStore, pushes: GithubPush[]) {
  if (pushes.length > 0) {
    await store(entityStore).advancedOperations.batchDelete(pushes)
  }
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubPushEntity)
}
