import { AllEntitiesStore, typePredicateParser } from '@symphoniacloud/dynamodb-entity-store'
import { GithubPush, isGithubPush } from '../../types/GithubPush'
import { GITHUB_PUSH } from '../entityTypes'
import { latestCommitInPush } from '../../github/githubPush'
import { CicadaEntity } from '../entityStoreEntitySupport'

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
    // Used when getting all activity per repo, so shared with GithubWorkflowRunEventEntity
    gsi1: {
      pk(source: Pick<GithubPush, 'accountId'>) {
        return `ACCOUNT#${source.accountId}`
      },
      sk(source: Pick<GithubPush, 'repoId' | 'dateTime'>) {
        return `REPO#${source.repoId}#DATETIME#${source.dateTime}`
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
