import { AllEntitiesStore, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GithubPush, isGithubPush } from '../../types/GithubPush'
import { GITHUB_PUSH } from '../entityTypes'
import { latestCommitInPush } from '../../github/githubPush'
import { CicadaEntity } from '../entityStoreEntitySupport'
import { githubActivityEntityGSISk, githubActivityEntityPk } from './GithubWorkflowRunEntity'

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

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubPushEntity)
}
