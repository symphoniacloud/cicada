import { GITHUB_PUSH, GITHUB_WORKFLOW_RUN } from '../entityTypes.js'
import {
  AllEntitiesStore,
  rangeWhereSkBeginsWith,
  typePredicateParser
} from '@symphoniacloud/dynamodb-entity-store'
import { CicadaEntity } from '../entityStoreEntitySupport.js'
import { domainObjectsFromMultipleEventEntityResponse } from '../entityStoreOperationSupport.js'
import { GithubPushEntity } from './GithubPushEntity.js'
import { GithubPush } from '../../types/GithubPush.js'

import {
  GitHubAccountKey,
  GitHubRepoId,
  GitHubRepoKey,
  GitHubWorkflowRunEvent
} from '../../../types/GitHubTypes.js'
import { isGitHubWorkflowRunEvent } from '../../../types/GitHubTypeChecks.js'

// Stores the latest run event per workflow run
const GithubWorkflowRunEntity: CicadaEntity<
  GitHubWorkflowRunEvent,
  Pick<GitHubWorkflowRunEvent, 'accountId'>,
  Pick<GitHubWorkflowRunEvent, 'repoId' | 'workflowId' | 'workflowRunId'>
> = {
  type: GITHUB_WORKFLOW_RUN,
  parse: typePredicateParser(isGitHubWorkflowRunEvent, GITHUB_WORKFLOW_RUN),
  pk(source: Pick<GitHubWorkflowRunEvent, 'accountId'>) {
    return `ACCOUNT#${source.accountId}`
  },
  sk(source: Pick<GitHubWorkflowRunEvent, 'repoId' | 'workflowId' | 'workflowRunId'>) {
    return `REPO#${source.repoId}#WORKFLOW#${source.workflowId}#WORKFLOW_RUN#RUN#${source.workflowRunId}`
  },
  gsis: {
    // Shared format with GithubWorkflowRunEventEntity and GithubPushEntity
    // Allows querying multiple entity types in one query operation
    gsi1: {
      pk(source: Pick<GitHubWorkflowRunEvent, 'accountId'>) {
        return githubActivityEntityPk(source)
      },
      sk(source: Pick<GitHubWorkflowRunEvent, 'repoId' | 'runEventUpdatedAt'>) {
        return githubActivityEntityGSISk(source.repoId, source.runEventUpdatedAt)
      }
    }
  }
}

// Also used by GithubWorkflowRunEventEntity and GithubPushEntity
export function githubActivityEntityPk({ accountId }: GitHubAccountKey) {
  return `ACCOUNT#${accountId}`
}

// Also used by GithubWorkflowRunEventEntity and GithubPushEntity
export function githubActivityEntityGSISk(repoId: GitHubRepoId, dateTime: string) {
  return `${githubActivityEntityGSISkPrefix(repoId)}#DATETIME#${dateTime}`
}

// Also used by GithubWorkflowRunEventEntity and GithubPushEntity
export function githubActivityEntityGSISkPrefix(repoId: GitHubRepoId) {
  return `REPO#${repoId}`
}

export async function putGithubWorkflowRunfNoKeyExistsOrNewerThanExisting(
  entityStore: AllEntitiesStore,
  event: GitHubWorkflowRunEvent
) {
  return await store(entityStore).put(event, {
    conditionExpression: 'attribute_not_exists(PK) OR #runEventUpdatedAt < :newRunEventUpdatedAt',
    expressionAttributeNames: { '#runEventUpdatedAt': 'runEventUpdatedAt' },
    expressionAttributeValues: { ':newRunEventUpdatedAt': event.runEventUpdatedAt }
  })
}

// Workflow Runs and Pushes deliberately use the same GSI key format so that they can be queried
// in one call. dynamdb-entity-store supports converting records for different entities during
// a query by using the `forMultiple` function
// 'forMultiple' requires a key entity, so I arbitrarily used this one, and also kept
// common key code in this module
export async function queryRunsAndPushesForRepo(
  entityStore: AllEntitiesStore,
  repoKey: GitHubRepoKey
): Promise<{
  runs: GitHubWorkflowRunEvent[]
  pushes: GithubPush[]
}> {
  const result = await entityStore
    // Workflow Run *events* (GithubWorkflowRunEventEntity) will also be returned by the DynamoDB query,
    // but the entity-store filters them out because the entity isn't specified in the 'forMultiple()' array
    .forMultiple([GithubWorkflowRunEntity, GithubPushEntity])
    .queryOnePageWithGsiByPkAndSk(
      GithubWorkflowRunEntity,
      repoKey,
      rangeWhereSkBeginsWith(githubActivityEntityGSISkPrefix(repoKey.repoId)),
      {
        scanIndexForward: false
      }
    )

  return {
    runs: domainObjectsFromMultipleEventEntityResponse(result, GITHUB_WORKFLOW_RUN),
    pushes: domainObjectsFromMultipleEventEntityResponse(result, GITHUB_PUSH)
  }
}

function store(entityStore: AllEntitiesStore) {
  return entityStore.for(GithubWorkflowRunEntity)
}
