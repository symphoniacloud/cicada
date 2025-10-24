import { AllEntitiesStore, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GITHUB_PUSH } from '../entityTypes.js'
import { latestCommitInPush } from '../../github/githubPush.js'
import { CicadaEntity } from '../entityStoreEntitySupport.js'
import { githubActivityEntityGSISk, githubActivityEntityPk } from './GithubWorkflowRunEntity.js'

import { GitHubAccountId, GitHubPush } from '../../../ioTypes/GitHubTypes.js'
import { isGitHubPush } from '../../../ioTypes/GitHubTypeChecks.js'

// Exported since also used by GithubWorkflowRunEntity
export const GithubPushEntity: CicadaEntity<
  GitHubPush,
  Pick<GitHubPush, 'accountId'>,
  Pick<GitHubPush, 'repoId' | 'ref' | 'commits'>
> = {
  type: GITHUB_PUSH,
  parse: typePredicateParser(isGitHubPush, GITHUB_PUSH),
  pk(source: Pick<GitHubPush, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  },
  // Add #PUSH in case in the future we want some other kind of activity per ref
  sk(source: Pick<GitHubPush, 'repoId' | 'ref' | 'commits'>) {
    return `REPO#${source.repoId}#REF#${source.ref}#PUSH#COMMIT#${latestCommitInPush(source).sha}`
  },
  gsis: {
    // Shared format with GithubWorkflowRunEventEntity and GithubPushEntity
    // Allows querying multiple entity types in one query operation
    gsi1: {
      pk(source: Pick<GitHubPush, 'accountId'>) {
        return githubActivityEntityPk(source)
      },
      sk(source: Pick<GitHubPush, 'repoId' | 'dateTime'>) {
        return githubActivityEntityGSISk(source.repoId, source.dateTime)
      }
    }
  }
}

export async function putPushIfNoKeyExists(entityStore: AllEntitiesStore, push: GitHubPush) {
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
export async function batchDeleteGithubPushes(entityStore: AllEntitiesStore, pushes: GitHubPush[]) {
  if (pushes.length > 0) {
    await store(entityStore).advancedOperations.batchDelete(pushes)
  }
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubPushEntity)
}
